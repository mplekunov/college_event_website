import { Request, Response } from "express";

import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from '../../database/IDatabase';

import bson from 'bson';

import BaseUserController from "./base/BaseUserController";
import BaseEventController from "./base/BaseEventController";
import IBaseEvent from "../model/internal/event/IBaseEvent";
import IEvent from "../model/internal/event/IEvent";
import { UniversityMemberType } from "../model/internal/universityMember/UniversityMemberType";
import { RSOMemberType } from "../model/internal/rsoMember/RSOMemberType";

/**
 * This class creates several properties responsible for event-actions 
 * provided to the user.
 */
export default class EventController extends BaseEventController {
    private userController: BaseUserController;

    constructor(eventDatabase: IDatabase<IBaseEvent, IEvent>, userController: BaseUserController) {
        super(eventDatabase);

        this.userController = userController
    }

    protected parseRegisterRequest(req: Request, res: Response): Promise<IBaseEvent> {
        let request: IBaseEvent = {
            eventID: new bson.ObjectId(),
            category: req.body?.category,
            date: req.body?.date,
            description: req.body?.description,
            email: req.body?.email,
            host: req.body?.host,
            location: req.body?.location,
            name: req.body?.name,
            phone: req.body?.phone
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
        let parameters = new Map<string, any>([["host", req.body?.host]]);

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
        let parameters = new Map<string, any>([["eventID", req.params.eventID]]);

        try {
            let event = await this.requestGet(parameters, res);

            return this.send(ResponseCodes.OK, res, event);
        } catch (response) {
            return response;
        }
    }

    add = async (req: Request, res: Response) => {
        let eventCreationSchema: IBaseEvent;

        try {
            eventCreationSchema = await this.parseRegisterRequest(req, res);

            let event = await this.requestCreate(eventCreationSchema, res);

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
        let parameters = new Map<string, any>([["eventID", req.params.eventID]]);
        let studentID = req.body?.studentID;

        try {
            let event = await this.requestGet(parameters, res);
            let student = await this.userController.requestGet(new Map<string, any>([["studentID", studentID]]), res);

            if (event.host.hostType == HostType.RSO &&
                student.organizationsAffiliation
                    .find(org => org.affiliationType.memberType == RSOMemberType.ADMIN) == undefined ||
                event.host.hostType == HostType.UNIVERSITY &&
                student.universityAffiliation.affiliationType.memberType != UniversityMemberType.STAFF
            ) {
                return this.send(ResponseCodes.FORBIDDEN, res, "User doesn't have permission for event removal.");
            }

            await this.requestDelete(event.eventID.toString(), res);

            return this.send(ResponseCodes.OK, res);
        } catch (response) {
            return response;
        }
    }
}
