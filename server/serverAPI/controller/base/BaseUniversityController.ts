import { Response } from "express";

import { ResponseCodes } from "../../../utils/ResponseCodes";

import IDatabase from "../../../database/IDatabase";

import BaseController from "./BaseController";
import IBaseUniversity from "../../model/internal/university/IBaseUniversity";
import IUniversity from "../../model/internal/university/IUniversity";

export default class BaseUniversityController extends BaseController {
    protected database: IDatabase<IBaseUniversity, IUniversity>;

    constructor(database: IDatabase<IBaseUniversity, IUniversity>) {
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

    public async requestCreate(university: IBaseUniversity, res: Response): Promise<IUniversity> {
        return this.database.Create(university).then(createdUniversity => {
            if (createdUniversity === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "University could not be created."));
            }

            return createdUniversity;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestUpdate(id: string, university: IBaseUniversity, res: Response): Promise<IUniversity> {
        return this.database.Update(id, university).then(updatedUniversity => {
            if (updatedUniversity === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "University could not be updated."));
            }

            return updatedUniversity;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestDelete(id: string, res: Response): Promise<boolean> {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "University could not be deleted."));
            }

            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestGetAll(parameters: Map<string, any>, res: Response): Promise<IBaseUniversity[]> {
        try {
            let promiseList = await this.database.GetAll(parameters);

            if (promiseList === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Universities could not be found."));
            }

            let objects: IBaseUniversity[] = [];

            promiseList.forEach(async promise => {
                let obj = await promise;
                if (obj !== null) {
                    objects.push(obj);
                }
            });
            return objects;

        } catch (error) {
            return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
        }
    }

    public async requestGet(parameters: Map<string, any>, res: Response): Promise<IUniversity> {
        return this.database.Get(parameters).then(async university => {
            if (university === null) {
                return Promise.reject(this.send(ResponseCodes.NOT_FOUND, res, "University could not be found."));
            }

            return university;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
