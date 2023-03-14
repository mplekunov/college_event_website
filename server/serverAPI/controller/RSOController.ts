import { Request, Response } from "express";

import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from '../../database/IDatabase';

import BaseRSOController from "./base/BaseRSOController";
import IRSO from "../model/internal/rso/IRSO";
import IMember from "../model/internal/member/IMember";
import IAffiliate from "../model/internal/affiliate/IAffiliate";
import IBaseRSO from "../model/internal/rso/IBaseRSO";
import RSORegisterRequestSchema from "../model/external/request/rso/RSORegisterRequest";

import bson, { ObjectId } from 'bson';
import BaseUserController from "./base/BaseUserController";

/**
 * This class creates several properties responsible for rso-actions 
 * provided to the user.
 */
export default class RSOController extends BaseRSOController {
    private userController: BaseUserController;

    constructor(rsoDatabase: IDatabase<IRSO, IRSO>, userController: BaseUserController) {
        super(rsoDatabase);

        this.userController = userController
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
        let parameters = new Map<string, any>([["universityID", req.serverUser.universityAffiliation.organization.universityID]]);

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
        let parameters = new Map<string, any>([["rsoID", req.params.rsoID]]);

        try {
            let rso = await this.requestGet(parameters, res);

            let userAffiliate = req.serverUser.organizationsAffiliation
                .find((member: IAffiliate<IBaseRSO, IMember<RSOMemberType>>) => member.organization.rsoID == rso.rsoID);

            if (userAffiliate == undefined) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be accessed due to user not being affiliated with RSO.");
            }

            if (userAffiliate?.affiliationType.memberType !== RSOMemberType.MEMBER &&
                userAffiliate?.affiliationType.memberType !== RSOMemberType.ADMIN) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be accessed due to lack of permission.");
            }

            return this.send(ResponseCodes.OK, res, rso);
        } catch (response) {
            return response;
        }
    }

    add = async (req: Request, res: Response) => {
        let rsoRegisterSchema: RSORegisterRequestSchema;

        try {
            rsoRegisterSchema = await this.parseRegisterRequest(req, res);

            if (rsoRegisterSchema.members.length < 4) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "RSO should contain at least 4 members.");
            }

            let uniqueStudents: Set<ObjectId> = new Set();

            rsoRegisterSchema.members.forEach((member: IMember<RSOMemberType>) => {
                if (uniqueStudents.has(member.userID)) {
                    return this.send(ResponseCodes.BAD_REQUEST, res, "RSO could not be created, duplicate users has been found.");
                }

                uniqueStudents.add(member.userID);
            });

            let admin = rsoRegisterSchema.members.find((member: IMember<RSOMemberType>) => member.memberType == RSOMemberType.ADMIN);

            if (admin === undefined) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be created, admin wasn't assigned.");
            }

            let adminStudent = await this.userController.requestGet(new Map<string, any>([["userID", admin.userID]]), res);

            rsoRegisterSchema.members
                .filter((member: IMember<RSOMemberType>) => member.memberType !== RSOMemberType.ADMIN)
                .forEach(async (member: IMember<RSOMemberType>) => {
                    let student = await this.userController.requestGet(new Map<string, any>([["userID", member.userID]]), res);

                    if (adminStudent.universityAffiliation.organization.universityID !== student.universityAffiliation.organization.universityID) {
                        return this.send(ResponseCodes.BAD_REQUEST, res, "RSO could not be created, all students should attend the same univesity");
                    } 
                });

            let rso = await this.requestCreate(rsoRegisterSchema, res);
            
            this.send(ResponseCodes.BAD_REQUEST, res, rso);
        } catch (response) {
            return response;
        }
    }

    /**
     * Becomes a member of RSO specified by rsoID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    enter = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["rsoID", req.params.rsoID]]);

        try {
            let rso = await this.requestGet(parameters, res);

            let rsoMember = rso.members.find((member: IMember<RSOMemberType>) => member.userID === req.serverUser.userID);

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
    leave = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["rsoID", req.params.rsoID]]);

        try {
            let rso = await this.requestGet(parameters, res);

            let rsoMember = rso.members.find((member: IMember<RSOMemberType>) => member.userID === req.serverUser.userID);

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
        let parameters = new Map<string, any>([["rsoID", req.params.rsoID]]);

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
