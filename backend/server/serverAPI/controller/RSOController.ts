import { Request, Response } from "express";

import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from '../../database/IDatabase';

import BaseRSOController from "./base/BaseRSOController";
import IRSO from "../model/internal/rso/IRSO";
import IMember from "../model/internal/member/IMember";

import BaseUserController from "./base/BaseUserController";
import { RSOMemberType } from "../model/internal/rsoMember/RSOMemberType";
import IBaseAffiliate from "../model/internal/affiliate/IBaseAffiliate";
import BaseRSOSchema from "../model/internal/rso/RSOSchema";

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

    protected parseRegisterRequest(req: Request, res: Response): Promise<BaseRSOSchema> {
        let request = new BaseRSOSchema(
            req.body?.name,
            req.body?.description,
            req.body?.members,
            req.body?.universityID
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
        let parameters = new Map<string, any>([["universityID", req.serverUser.universityAffiliation.organizationID], ["query", req.query?.query]]);

        if (req.query?.userRSOS !== undefined && Boolean(req.query?.userRSOS)) {
            return this.requestGetAll(new Map([["userID", req.serverUser.userID.toString()]]), res).then(rso => {
                return this.send(ResponseCodes.OK, res, rso);
            }, (response) => response);
        } else {
            return this.requestGetAll(parameters, res).then(rso => {
                return this.send(ResponseCodes.OK, res, rso);
            }, (response) => response);
        }
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
                .find((member: IBaseAffiliate) => member.organizationID.equals(rso.rsoID));

            let userMember = rso.members.filter((member: IMember<RSOMemberType>) => member.userID.equals(req.serverUser.userID));

            if (userAffiliate == undefined || userMember.length == 0) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be accessed due to user not being affiliated with RSO.");
            }

            if (userMember[0].memberType !== RSOMemberType.MEMBER &&
                userMember[0].memberType !== RSOMemberType.ADMIN) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be accessed due to lack of permission.");
            }

            return this.send(ResponseCodes.OK, res, rso);
        } catch (response) {
            return response;
        }
    }

    create = async (req: Request, res: Response) => {
        let rsoRegisterSchema: BaseRSOSchema;

        try {
            rsoRegisterSchema = await this.parseRegisterRequest(req, res);

            if (rsoRegisterSchema.members.length < 4) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "RSO should contain at least 4 members.");
            }

            let uniqueStudents = new Set();

            let userInRSO = rsoRegisterSchema.members.find((member: IMember<RSOMemberType>) => member.userID.toString() === req.serverUser.userID.toString());

            if (userInRSO === undefined) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "User is not in RSO.");
            }

            rsoRegisterSchema.members.forEach((member: IMember<RSOMemberType>) => {
                if (uniqueStudents.has(member.userID.toString())) {
                    return this.send(ResponseCodes.BAD_REQUEST, res, "RSO could not be created, duplicate users has been found.");
                }

                uniqueStudents.add(member.userID.toString());
            });

            let admin = rsoRegisterSchema.members.find((member: IMember<RSOMemberType>) => member.memberType === RSOMemberType.ADMIN);

            if (admin === undefined) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be created, admin wasn't assigned.");
            }

            let adminStudent = await this.userController.requestGet(new Map<string, any>([["userID", admin.userID]]), res);

            let members = rsoRegisterSchema.members.filter((member: IMember<RSOMemberType>) => member.memberType !== RSOMemberType.ADMIN);

            for (const member of members) {
                let student = await this.userController.requestGet(new Map<string, any>([["userID", member.userID]]), res);

                if (adminStudent.universityAffiliation.organizationName !== student.universityAffiliation.organizationName) {
                    return this.send(ResponseCodes.BAD_REQUEST, res, "RSO could not be created, all students should attend the same univesity");
                }
            }

            let rso = await this.requestCreate(rsoRegisterSchema, res);

            req.serverUser.organizationsAffiliation.push({
                organizationID: rso.rsoID,
                organizationName: rso.name,
            });

            req.serverUser = await this.userController.requestUpdate(req.serverUser.userID.toString(), req.serverUser, res);

            return this.send(ResponseCodes.OK, res, rso);
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

            let rsoMember = rso.members.find((member: IMember<RSOMemberType>) => member.userID.equals(req.serverUser.userID));

            if (rsoMember !== undefined) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "User is already affiliated with RSO.");
            }

            let member: IMember<RSOMemberType> = {
                memberType: RSOMemberType.MEMBER,
                userID: req.serverUser.userID,
            };

            rso.members.push(member);

            await this.requestUpdate(rso.rsoID.toString(), rso, res);

            req.serverUser.organizationsAffiliation.push({
                organizationID: rso.rsoID,
                organizationName: rso.name,
            });

            req.serverUser = await this.userController.requestUpdate(req.serverUser.userID.toString(), req.serverUser, res);

            return this.send(ResponseCodes.OK, res, "RSO has been updated.");
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

            let rsoMember = rso.members.find((member: IMember<RSOMemberType>) => member.userID.equals(req.serverUser.userID));

            if (rsoMember === undefined) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "User is not affiliated with RSO.");
            }

            let updatedMembers: IMember<RSOMemberType>[] = [];

            rso.members.forEach((member: IMember<RSOMemberType>) => {
                if (!req.serverUser.userID.equals(member.userID)) {
                    updatedMembers.push(member);
                }
            });

            rso.members = updatedMembers;

            await this.requestUpdate(rso.rsoID.toString(), rso, res);

            req.serverUser.organizationsAffiliation = req.serverUser.organizationsAffiliation.filter((member: IBaseAffiliate) => !member.organizationID.equals(rso.rsoID));

            req.serverUser = await this.userController.requestUpdate(req.serverUser.userID.toString(), req.serverUser, res);

            return this.send(ResponseCodes.OK, res, "User leaved RSO.");
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
                .find((member: IBaseAffiliate) => member.organizationID.equals(rso.rsoID));

            let userMember = rso.members.filter((member: IMember<RSOMemberType>) => member.userID.equals(req.serverUser.userID));

            if (userAffiliate == undefined || userMember.length == 0) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be accessed due to user not being affiliated with RSO.");
            }

            if (userMember[0].memberType !== RSOMemberType.ADMIN) {
                return this.send(ResponseCodes.FORBIDDEN, res, "RSO could not be deleted due to lack of permission.");
            }

            let result = await this.requestDelete(rso.rsoID.toString(), res)
            if (!result) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "RSO could not be deleted.");
            }

            req.serverUser.organizationsAffiliation = req.serverUser.organizationsAffiliation.filter((member: IBaseAffiliate) => !member.organizationID.equals(rso.rsoID));

            req.serverUser = await this.userController.requestUpdate(req.serverUser.userID.toString(), req.serverUser, res);

            return this.send(ResponseCodes.OK, res);
        } catch (response) {
            return response;
        }
    }
}
