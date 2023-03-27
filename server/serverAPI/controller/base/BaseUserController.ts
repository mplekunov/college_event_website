import { Response } from "express";

import { ResponseCodes } from "../../../utils/ResponseCodes";

import IDatabase from "../../../database/IDatabase";

import IUser from "../../model/internal/user/IUser";
import IUserResponse from "../../model/external/response/user/IUserResponse";

import BaseController from "./BaseController";
import IBaseUser from "../../model/internal/user/IBaseUser";

export default class BaseUserController extends BaseController {
    protected database: IDatabase<IBaseUser, IUser>;

    constructor(database: IDatabase<IBaseUser, IUser>) {
        super();
        this.database = database;
    }

    public convertToUserResponse(user: IBaseUser): IUserResponse {
        return {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen,
            email: user.email,
            userLevel: user.userLevel,
            universityAffiliation: user.universityAffiliation,
        }
    }

    public async usernameExists(username: string, res: Response): Promise<boolean> {
        return this.database.Get(new Map([["username", username]])).then(async user => {
            return Promise.resolve(user !== null);
        }, (error) => {
            return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, error))
        });
    }

    public async emailExists(email: string, res: Response): Promise<boolean> {
        return this.database.Get(new Map([["email", email]])).then(async user => {
            return Promise.resolve(user !== null);
        }, (error) => {
            return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, error))
        });
    }

    public async requestCreate(user: IUser, res: Response): Promise<IUser> {
        return this.database.Create(user).then(createdUser => {
            if (createdUser === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "User could not be created."));
            }

            return createdUser;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestUpdate(id: string, user: IBaseUser, res: Response): Promise<IUser> {
        return this.database.Update(id, user).then(updatedUser => {
            if (updatedUser === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "User could not be updated."));
            }

            return updatedUser;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestDelete(id: string, res: Response): Promise<boolean> {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "User could not be deleted."));
            }

            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestGet(parameters: Map<string, any>, res: Response): Promise<IUser> {
        return this.database.Get(parameters).then(async user => {

            if (user === null) {
                return Promise.reject(this.send(ResponseCodes.NOT_FOUND, res, "User could not be found."));
            }

            return user;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
