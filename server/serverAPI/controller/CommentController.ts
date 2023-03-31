import { Request, Response } from "express";

import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from '../../database/IDatabase';

import bson from 'bson';

import IBaseEvent from "../model/internal/event/IBaseEvent";
import IEvent from "../model/internal/event/IEvent";
import { RSOMemberType } from "../model/internal/rsoMember/RSOMemberType";
import BaseRSOController from './base/BaseRSOController';
import IMember from '../model/internal/member/IMember';
import BaseUniversityController from './base/BaseUniversityController';
import { UserLevel } from "../model/internal/user/UserLevel";
import { ObjectId } from 'bson';
import BaseEventSchema from '../model/internal/event/BaseEventSchema';
import BaseLocationSchema from '../model/internal/location/BaseLocationSchema';
import BaseCommentController from './base/BaseCommentController';
import IBaseComment from '../model/internal/comment/IBaseComment';
import IComment from '../model/internal/comment/IComment';
import BaseEventController from "./base/BaseEventController";
import BaseCommentSchema from "../model/internal/comment/BaseCommentSchema";

/**
 * This class creates several properties responsible for event-actions 
 * provided to the user.
 */
export default class CommentController extends BaseCommentController {
    private eventController: BaseEventController;

    constructor(eventDatabase: IDatabase<IBaseComment, IComment>, eventController: BaseEventController) {
        super(eventDatabase);

        this.eventController = eventController
    }

    protected parseRegisterRequest(req: Request, res: Response): Promise<IBaseComment> {
        let request = new BaseCommentSchema(
            req.body?.content,
            req.serverUser.userID,
            new ObjectId(req.body?.eventID)
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
        let parameters = new Map<string, any>([["eventID", req.body?.eventID]]);

        return this.requestGetAll(parameters, res).then(rso => {
            return this.send(ResponseCodes.OK, res, rso);
        }, (response) => response);
    }

    /**
     * Gets information about RSO at specified rsoID.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["commentID", req.params.commentID]]);

        try {
            let comment = await this.requestGet(parameters, res);

            return this.send(ResponseCodes.OK, res, comment);
        } catch (response) {
            return response;
        }
    }

    create = async (req: Request, res: Response) => {
        let commentCreationSchema: IBaseComment;

        try {
            commentCreationSchema = await this.parseRegisterRequest(req, res);

            let event = await this.eventController.requestGet(new Map([["eventID", commentCreationSchema.eventID]]), res);

            if (event === undefined) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "Event doesn't exist.");
            }

            let comment = await this.requestCreate(commentCreationSchema, res);

            return this.send(ResponseCodes.OK, res, comment);
        } catch (response) {
            return response;
        }
    }

    update = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["commentID", req.params.commentID]]);

        try {
            let comment = await this.requestGet(parameters, res);

            if (comment === undefined) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "Comment doesn't exist.");
            }

            if (comment.userID !== req.serverUser.userID) {
                return this.send(ResponseCodes.UNAUTHORIZED, res, "You are not authorized to update this comment.");
            }

            let commentUpdateSchema = new BaseCommentSchema(
                req.body?.content,
                req.serverUser.userID,
                comment.eventID
            );

            this.verifySchema(commentUpdateSchema, res);

            let updatedComment = await this.requestUpdate(req.params.commentID, commentUpdateSchema, res);

            return this.send(ResponseCodes.OK, res, updatedComment);
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
        let parameters = new Map<string, any>([["commentID", req.params.commentID]]);

        try {
            let comment = await this.requestGet(parameters, res);

            if (comment === undefined) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "Comment doesn't exist.");
            }

            if (comment.userID !== req.serverUser.userID) {
                return this.send(ResponseCodes.UNAUTHORIZED, res, "You are not authorized to delete this comment.");
            }

            await this.requestDelete(req.params.commentID, res);

            return this.send(ResponseCodes.OK, res, "Comment has been deleted.");
        } catch (response) {
            return response;
        }
    }
}
