import { Response } from "express";

import { ResponseCodes } from "../../../utils/ResponseCodes";

import IDatabase from "../../../database/IDatabase";

import BaseController from "./BaseController";
import IRSO from "../../model/internal/rso/IRSO";
import IBaseRSO from "../../model/internal/rso/IBaseRSO";

export default class BaseRSOController extends BaseController {
    protected database: IDatabase<IRSO, IRSO>;

    constructor(database: IDatabase<IBaseRSO, IRSO>) {
        super();
        this.database = database;
    }

    public async rsoExists(name: string, res: Response): Promise<boolean> {
        return this.database.Get(new Map([["name", name]])).then(async rso => {
            return Promise.resolve(rso !== null);
        }, (error) => {
            return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, error))
        });
    }

    public async requestCreate(rso: IRSO, res: Response): Promise<IRSO> {
        return this.database.Create(rso).then(createdRSO => {
            if (createdRSO === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "RSO could not be created."));
            }

            return createdRSO;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestUpdate(id: string, rso: IRSO, res: Response): Promise<IRSO> {
        return this.database.Update(id, rso).then(updatedRSO => {
            if (updatedRSO === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "RSO could not be updated."));
            }

            return updatedRSO;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestDelete(id: string, res: Response): Promise<boolean> {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "RSO could not be deleted."));
            }

            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestGetAll(parameters: Map<string, any>, res: Response): Promise<IRSO[]> {
        return this.database.GetAll(parameters).then(async rso => {
            if (rso === null) {
                return Promise.reject(this.send(ResponseCodes.NOT_FOUND, res, "RSO could not be found."));
            }

            return rso;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestGet(parameters: Map<string, any>, res: Response): Promise<IRSO> {
        return this.database.Get(parameters).then(async rso => {
            if (rso === null) {
                return Promise.reject(this.send(ResponseCodes.NOT_FOUND, res, "RSO could not be found."));
            }

            return rso;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
