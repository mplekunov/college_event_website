import { Request, Response } from "express";

import { ResponseCodes } from "../../utils/ResponseCodes";

import JWTStorage from "../middleware/authentication/JWTStorage";

import IDatabase from '../../database/IDatabase';

import BaseRSOController from "./base/BaseRSOController";
import IRSO from "../model/internal/rso/IRSO";

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export default class UserController extends BaseRSOController {
    constructor(database: IDatabase<IRSO, IRSO>) {
        super(database);
    }

    /**
     * Gets information about user at specified userID.
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
     * Gets information about user at specified userID.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["rsoID", req.serverUser.universityAffiliation.organization]]);

        return this.requestGet(parameters, res).then(rso => {
            return this.send(ResponseCodes.OK, res, rso);
        }, (response) => response);
    }

    /**
     * Deletes user object at specified userID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res);

            let result = await this.requestDelete(req.serverUser.username, res)
            if (!result) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "User could not be deleted.");
            }

            JWTStorage.getInstance().deleteJWT(user.username);

            return this.send(ResponseCodes.OK, res);
        } catch (response) {
            return response;
        }
    }
}
