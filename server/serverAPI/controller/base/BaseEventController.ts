import { Response } from "express";

import { ResponseCodes } from "../../../utils/ResponseCodes";

import IDatabase from "../../../database/IDatabase";

import BaseController from "./BaseController";
import IBaseEvent from "../../model/internal/event/IBaseEvent";
import IEvent from "../../model/internal/event/IEvent";

export default class BaseEventController extends BaseController {
    protected database: IDatabase<IBaseEvent, IEvent>;

    /**
     * 
     * event can be public, private, or an RSO event.
     */
    constructor(database: IDatabase<IBaseEvent, IEvent>) {
        super();
        this.database = database;
    }

    public async requestCreate(event: IBaseEvent, res: Response): Promise<IEvent> {
        return this.database.Create(event).then(createdEvent => {
            if (createdEvent === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Event could not be created."));
            }

            return createdEvent;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestUpdate(id: string, event: IEvent, res: Response): Promise<IEvent> {
        return this.database.Update(id, event).then(updatedRSO => {
            if (updatedRSO === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Event could not be updated."));
            }

            return updatedRSO;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestDelete(id: string, res: Response): Promise<boolean> {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Event could not be deleted."));
            }

            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestGetAll(parameters: Map<string, any>, res: Response): Promise<IBaseEvent[]> {
        try {
            let promiseList = await this.database.GetAll(parameters);

            if (promiseList === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Events could not be found."));
            }

            let objects: IBaseEvent[] = [];

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

    public async requestGet(parameters: Map<string, any>, res: Response): Promise<IEvent> {
        return this.database.Get(parameters).then(async event => {
            if (event === null) {
                return Promise.reject(this.send(ResponseCodes.NOT_FOUND, res, "Event could not be found."));
            }

            return event;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
