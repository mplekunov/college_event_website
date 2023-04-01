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
import { HostType } from "../model/internal/host/HostType";
import { ObjectId } from 'bson';
import BaseEventController from "./base/BaseEventController";
import BaseEventSchema from '../model/internal/event/BaseEventSchema';
import BaseLocationSchema from '../model/internal/location/BaseLocationSchema';

/**
 * This class creates several properties responsible for event-actions 
 * provided to the user.
 */
export default class EventController extends BaseEventController {
    private rsoController: BaseRSOController;
    private universityController: BaseUniversityController;

    constructor(eventDatabase: IDatabase<IBaseEvent, IEvent>, rsoController: BaseRSOController, universityController: BaseUniversityController) {
        super(eventDatabase);

        this.rsoController = rsoController
        this.universityController = universityController;
    }

    protected parseRegisterRequest(req: Request, res: Response): Promise<BaseEventSchema> {
        let request = new BaseEventSchema(
            req.body?.name,
            new ObjectId(req.body?.hostID),
            parseInt(req.body?.hostType) as HostType,
            req.body?.category,
            req.body?.description,
            parseInt(req.body?.date),
            new BaseLocationSchema(
                req.body?.location?.address,
                parseFloat(req.body?.location?.longitude),
                parseFloat(req.body?.location?.latitude)
            ),
            req.body?.email,
            req.body?.phone
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
        let parameters = new Map<string, any>([["hostID", req.body?.hostID], ["hostType", parseInt(req.body?.hostType)]]);

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

    create = async (req: Request, res: Response) => {
        let eventCreationSchema: IBaseEvent;

        try {
            eventCreationSchema = await this.parseRegisterRequest(req, res);

            switch (eventCreationSchema.hostType as HostType) {
                case HostType.PUBLIC:
                    break;
                case HostType.UNIVERSITY:
                    break;
                case HostType.RSO:
                    let rso = await this.rsoController.requestGet(new Map([["rsoID", eventCreationSchema.hostID]]), res);

                    let member = rso.members.find((member: IMember<RSOMemberType>) => member.userID.equals(req.serverUser.userID));

                    if (member === undefined) {
                        return this.send(ResponseCodes.BAD_REQUEST, res, "User is not in the RSO.");
                    }

                    break;
                default:
                    break;
            }

            let event = await this.requestCreate(eventCreationSchema, res);

            return this.send(ResponseCodes.BAD_REQUEST, res, event);
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

        try {
            let event = await this.requestGet(parameters, res);

            switch (event.hostType) {
                case HostType.RSO:
                    let rso = await this.rsoController.requestGet(new Map([["rsoID", event.hostID]]), res);
                    let member = rso.members.find((member: IMember<RSOMemberType>) => member.userID.equals(req.serverUser.userID));

                    if (member === undefined) {
                        return this.send(ResponseCodes.BAD_REQUEST, res, "User is not in the RSO.");
                    }

                    if (member.memberType !== RSOMemberType.ADMIN) {
                        return this.send(ResponseCodes.UNAUTHORIZED, res, "User doesn't have enough permissions.");
                    }

                    break;
                case HostType.PUBLIC:
                    if (!req.serverUser.userID.equals(event.hostID)) {
                        return this.send(ResponseCodes.UNAUTHORIZED, res, "User doesn't have enough permissions.");
                    }

                    break;
                case HostType.UNIVERSITY:
                    let university = await this.universityController.requestGet(new Map([["universityID", event.hostID]]), res);

                    if (!university.universityID.equals(req.serverUser.universityAffiliation.organizationID) ||
                        req.serverUser.userLevel !== UserLevel.SUPER_ADMIN) {
                        return this.send(ResponseCodes.UNAUTHORIZED, res, "User doesn't have enough permissions.");
                    }

                    break;

                default:
                    break;
            }

            await this.requestDelete(event.eventID.toString(), res);

            return this.send(ResponseCodes.OK, res);
        } catch (response) {
            return response;
        }
    }
}
