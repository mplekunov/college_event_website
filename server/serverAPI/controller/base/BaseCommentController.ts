import { Response } from "express";

import { ResponseCodes } from "../../../utils/ResponseCodes";

import IDatabase from "../../../database/IDatabase";

import BaseController from "./BaseController";
import IBaseEvent from "../../model/internal/event/IBaseEvent";
import IEvent from "../../model/internal/event/IEvent";
import IComment from '../../model/internal/comment/IComment';
import IBaseComment from "../../model/internal/comment/IBaseComment";

export default class BaseCommentController extends BaseController {
    protected database: IDatabase<IBaseComment, IComment>;

    /**
     * 
     * event can be public, private, or an RSO event.
     */
    constructor(database: IDatabase<IBaseComment, IComment>) {
        super();
        this.database = database;
    }

    public async requestCreate(comment: IBaseComment, res: Response): Promise<IComment> {
        return this.database.Create(comment).then(createdComment => {
            if (createdComment === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Comment could not be created."));
            }

            return createdComment;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestUpdate(id: string, comment: IBaseComment, res: Response): Promise<IComment> {
        return this.database.Update(id, comment).then(updatedComment => {
            if (updatedComment === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Comment could not be updated."));
            }

            return updatedComment;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestDelete(id: string, res: Response): Promise<boolean> {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Comment could not be deleted."));
            }

            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    public async requestGetAll(parameters: Map<string, any>, res: Response): Promise<IComment[]> {
        try {
            let promiseList = await this.database.GetAll(parameters);

            if (promiseList === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Comments could not be found."));
            }

            let objects: IComment[] = [];

            for (const promise of promiseList) {
                let obj = await promise;

                if (obj !== null) {
                    objects.push(obj);
                }
            }
            
            return objects;

        } catch (error) {
            return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
        }
    }

    public async requestGet(parameters: Map<string, any>, res: Response): Promise<IComment> {
        return this.database.Get(parameters).then(async comment => {
            if (comment === null) {
                return Promise.reject(this.send(ResponseCodes.NOT_FOUND, res, "Comment could not be found."));
            }

            return comment;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
