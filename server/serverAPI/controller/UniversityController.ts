import { Request, Response } from "express";

import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from '../../database/IDatabase';

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
        let parameters = new Map<string, any>([["query", req.query?.query]]);

        return this.requestGetAll(parameters, res).then(universities => {
            return this.send(ResponseCodes.OK, res, universities);
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

        console.log(parameters);
        try {
            let university = await this.requestGet(parameters, res);

            // if (req.serverUser.userLevel !== UserLevel.ADMIN && req.serverUser.universityAffiliation.organizationName !== university.name) {
            //     return this.send(ResponseCodes.UNAUTHORIZED, res, "You are not authorized to perform this action.");
            // }

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
