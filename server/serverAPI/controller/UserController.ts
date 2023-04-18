import { Request, Response } from "express";

import { ResponseCodes } from "../../utils/ResponseCodes";

import JWTStorage from "../middleware/authentication/JWTStorage";

import IDatabase from '../../database/IDatabase';

import IUser from "../model/internal/user/IUser";

import BaseUserController from "./base/BaseUserController";
import IBaseUser from "../model/internal/user/IBaseUser";

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export default class UserController extends BaseUserController {
    constructor(database: IDatabase<IBaseUser, IUser>) {
        super(database);
    }

    /**
     * Gets information about user at specified userID.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(user => {
            return this.send(ResponseCodes.OK, res, this.convertToUserResponse(user));
        }, (response) => response);
    }

    getUser = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["userID", req.params.userID]]);

        return this.requestGet(parameters, res).then(user => {
            return this.send(ResponseCodes.OK, res, this.convertToUserResponse(user));
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

            let result = await this.requestDelete(req.serverUser.userID.toString(), res)
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
