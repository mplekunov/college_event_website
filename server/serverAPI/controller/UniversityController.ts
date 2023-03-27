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
import { RSOMemberType } from "../model/internal/rsoMember/RSOMemberType";
import BaseUniversityController from "./base/BaseUniversityController";
import IBaseUniversity from "../model/internal/university/IBaseUniversity";
import IUniversity from "../model/internal/university/IUniversity";
import { UserLevel } from "../model/internal/user/UserLevel";

/**
 * This class creates several properties responsible for rso-actions 
 * provided to the user.
 */
export default class UniversityController extends BaseUniversityController {
    constructor(universityDatabase: IDatabase<IBaseUniversity, IUniversity>) {
        super(universityDatabase);
    }

    /**
     * Gets information about all universities.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["query", req.body?.query]]);

        return this.requestGetAll(parameters, res).then(rso => {
            return this.send(ResponseCodes.OK, res, rso);
        }, (response) => response);
    }

    /**
     * Gets information about University at specified university.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["universityID", req.params?.universityID]]);

        try {
            let university = await this.requestGet(parameters, res);

            if (req.serverUser.userLevel !== UserLevel.ADMIN && req.serverUser.universityAffiliation.organizationName !== university.name) {
                return this.send(ResponseCodes.UNAUTHORIZED, res, "You are not authorized to perform this action.");
            }

            return this.send(ResponseCodes.OK, res, university);
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
        let parameters = new Map<string, any>([["university", req.params?.rsoID]]);

        try {
            let rso = await this.requestGet(parameters, res);


            return this.send(ResponseCodes.OK, res);
        } catch (response) {
            return response;
        }
    }
}
