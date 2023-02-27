import { Request, Response } from "express";

import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from '../../database/IDatabase';

import BaseRSOController from "./base/BaseRSOController";
import IRSO from "../model/internal/rso/IRSO";
import IMember from "../model/internal/member/IMember";
import IAffiliate from "../model/internal/affiliate/IAffiliate";
import IBaseRSO from "../model/internal/rso/IBaseRSO";
import RSORegisterRequestSchema from "../model/external/request/rso/RSORegisterRequest";

import bson from 'bson';

/**
 * This class creates several properties responsible for rso-actions 
 * provided to the user.
 */
export default class RSOController extends BaseRSOController {
    constructor(rsoDatabase: IDatabase<IRSO, IRSO>) {
        super(rsoDatabase);
    }

    protected parseRegisterRequest(req: Request, res: Response): Promise<RSORegisterRequestSchema> {
        let request = new RSORegisterRequestSchema(
            req.body?.name,
            req.body?.description,
            new bson.ObjectId(),
            req.body?.members
        );

        return this.verifySchema(request, res);
    }

    /**
     * Gets information about all RSOs at user's university.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["university", req.serverUser.universityAffiliation.organization]]);

        return this.requestGetAll(parameters, res).then(rso => {
            return this.send(ResponseCodes.OK, res, rso);
        }, (response) => response);
    }

    /**
     * Gets information about RSO at specified rsoID.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["rsoID", req.body?.rsoID]]);

        try {
            let rso = await this.requestGet(parameters, res);

            let userAffiliate = req.serverUser.organizationsAffiliation
                .find((member: IAffiliate<IBaseRSO, IMember<RSOMemberType>>) => member.organization.rsoID == rso.rsoID);

            if (userAffiliate == undefined) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be deleted due to user not being affiliated with RSO.");
            }

            if (userAffiliate?.affiliationType.memberType !== RSOMemberType.MEMBER &&
                userAffiliate?.affiliationType.memberType !== RSOMemberType.ADMIN) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be deleted due to lack of permission.");
            }

        } catch (response) {
            return response;
        }


        return this.requestGet(parameters, res).then(rso => {
            return this.send(ResponseCodes.OK, res, rso);
        }, (response) => response);
    }

    createRSO = async (req: Request, res: Response) => {
        let rsoRegisterSchema: RSORegisterRequestSchema;

        try {
            rsoRegisterSchema = await this.parseRegisterRequest(req, res);

            if (rsoRegisterSchema.members.length < 4) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "RSO should contain at least 4 members.");
            }

            let differentUniversity = rsoRegisterSchema.members.find((member: IMember<RSOMemberType>) => member)
        } catch (response) {
            return response;
        }

        throw Error("Not Implemented");
    }

    /**
     * Becomes a member of RSO specified by rsoID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    enterRSO = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["rsoID", req.body?.rsoID]]);

        try {
            let rso = await this.requestGet(parameters, res);

            let rsoMember = rso.members.find((member: IMember<RSOMemberType>) => member.userID == - req.serverUser.userID);

            if (rsoMember !== undefined) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "User is already affiliated with RSO.");
            }

            let member: IMember<RSOMemberType> = {
                memberType: RSOMemberType.MEMBER,
                userID: req.serverUser.userID,
                organizationID: rso.rsoID
            };

            rso.members.push(member);

            await this.requestUpdate(rso.rsoID.toString(), rso, res);
        } catch (response) {
            return response;
        }
    }

    /**
     * Leaves the RSO specified by rsoID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    leaveRSO = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["rsoID", req.body?.rsoID]]);

        try {
            let rso = await this.requestGet(parameters, res);

            let rsoMember = rso.members.find((member: IMember<RSOMemberType>) => member.userID == - req.serverUser.userID);

            if (rsoMember == undefined) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "User is not affiliated with RSO.");
            }

            let updatedMembers: IMember<RSOMemberType>[] = [];

            rso.members.forEach((member: IMember<RSOMemberType>) => {
                if (req.serverUser.userID !== member.userID) {
                    updatedMembers.push(member);
                }
            });

            rso.members = updatedMembers;

            await this.requestUpdate(rso.rsoID.toString(), rso, res);
        } catch (response) {
            return response;
        }
    }

    /**
     * Deletes rso object at specified rsoID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["rsoID", req.body?.rsoID]]);

        try {
            let rso = await this.requestGet(parameters, res);

            let userAffiliate = req.serverUser.organizationsAffiliation
                .find((member: IAffiliate<IBaseRSO, IMember<RSOMemberType>>) => member.organization.rsoID == rso.rsoID);

            if (userAffiliate == undefined) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be deleted due to user not being affiliated with RSO.");
            }

            if (userAffiliate?.affiliationType.memberType !== RSOMemberType.ADMIN) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be deleted due to lack of permission.");
            }

            let result = await this.requestDelete(rso.rsoID.toString(), res)
            if (!result) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "RSO could not be deleted.");
            }

            return this.send(ResponseCodes.OK, res);
        } catch (response) {
            return response;
        }
    }
}
