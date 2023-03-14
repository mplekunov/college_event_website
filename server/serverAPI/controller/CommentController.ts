import { Request, Response } from "express";

import { ResponseCodes } from "../../utils/ResponseCodes";

import bson from 'bson';

import IComment from "../model/internal/comment/IComment";
import BaseController from "./base/BaseController";
import EventController from "./EventController";

/**
 * This class creates several properties responsible for event-actions 
 * provided to the user.
 */
export default class CommentController extends BaseController {
    eventController: EventController;

    constructor(eventController: EventController) {
        super();
        
        this.eventController = eventController;
    }

    protected parseAddRequest(req: Request, res: Response): Promise<IComment> {
        let request: IComment = {
            commentID: new bson.ObjectId(),
            content: req.body?.content,
            userID : req.body?.userID    
        };

        return Promise.resolve(request);
        // return this.verifySchema(request, res);
    }

    /**
     * Gets information about all RSOs at user's university.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["eventID", req.body?.eventID]]);

        return this.eventController.requestGet(parameters, res).then(event => {
            return this.send(ResponseCodes.OK, res, event.comments);
        }, (response) => response);
    }

    /**
     * Gets information about RSO at specified rsoID.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["eventID", req.body?.eventID]]);
        let commentID = req.body?.commentID;

        try {
            let event = await this.eventController.requestGet(parameters, res);
            let comment = event.comments.find(comment => comment.commentID == commentID);

            return this.send(ResponseCodes.OK, res, comment);
        } catch (response) {
            return response;
        }
    }

    add = async (req: Request, res: Response) => {
        let commentCreationSchema: IComment;
        let eventID = req.body?.eventID;

        try {
            commentCreationSchema = await this.parseAddRequest(req, res);

            let event = await this.eventController.requestGet(new Map<string, any>([["eventID", eventID]]), res);

            event.comments.push(commentCreationSchema);

            await this.eventController.requestUpdate(eventID, event, res);
            this.send(ResponseCodes.BAD_REQUEST, res, event);
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
        let parameters = new Map<string, any>([["eventID", req.body?.eventID]]);
        let commentID = req.body?.commentID;

        try {
            let event = await this.eventController.requestGet(parameters, res);

            event.comments = event.comments.filter(comment => comment.commentID != commentID);

            await this.eventController.requestUpdate(event.eventID.toString(), event, res);

            return this.send(ResponseCodes.OK, res, event.comments);
        } catch (response) {
            return response;
        }
    }
}
