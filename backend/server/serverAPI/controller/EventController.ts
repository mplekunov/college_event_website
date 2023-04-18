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
import { HostType } from '../model/internal/host/HostType';
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

        // HostType
        /**
         * Public
         * RSO
         * University
         * 
         * if public => Show all public events
         * 
         * if University => use universityID of the currently logged in user as hostID and show all University events
         * 
         * if RSO => use ids of all RSOs that user currently affiliated for hostID parameter and show all RSO events
         */

        let parameters = new Map<string, any>();

        if (req.query?.hostType !== undefined && (parseInt(String(req.query.hostType)) as HostType) === HostType.PUBLIC) {
            parameters.set("hostType", HostType.PUBLIC);
        } else if (req.query?.hostType !== undefined && (parseInt(String(req.query.hostType)) as HostType) === HostType.UNIVERSITY) {
            parameters.set("hostID", req.serverUser.universityAffiliation.organizationID);
            parameters.set("hostType", HostType.UNIVERSITY);
        } else if (req.query?.hostType !== undefined && (parseInt(String(req.query.hostType)) as HostType) === HostType.RSO) {
            let rsoIDs = req.serverUser.organizationsAffiliation.map((organization) => organization.organizationID);
            parameters.set("hostID", rsoIDs);
            parameters.set("hostType", HostType.RSO);
        }

        return this.requestGetAll(parameters, res).then(events => {
            return this.send(ResponseCodes.OK, res, events);
        }, (response) => {
            return response;
        });
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

                    if (member.memberType !== RSOMemberType.ADMIN) {
                        return this.send(ResponseCodes.BAD_REQUEST, res, "User is not an admin of the RSO.");
                    }

                    break;
                default:
                    break;
            }

            let event = await this.requestCreate(eventCreationSchema, res);

            return this.send(ResponseCodes.OK, res, event);
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
                        return this.send(ResponseCodes.UNAUTHORIZED, res, "User isn't an Admin of the RSO.");
                    }

                    break;
                case HostType.PUBLIC:
                    if (!req.serverUser.userID.equals(event.hostID) && req.serverUser.userLevel !== UserLevel.SUPER_ADMIN) {
                        return this.send(ResponseCodes.UNAUTHORIZED, res, "User isn't authorized personnel of the University nor creator of the event.");
                    }

                    break;
                case HostType.UNIVERSITY:
                    let university = await this.universityController.requestGet(new Map([["universityID", event.hostID]]), res);

                    if (!university.universityID.equals(req.serverUser.universityAffiliation.organizationID) ||
                        req.serverUser.userLevel !== UserLevel.SUPER_ADMIN) {

                        return this.send(ResponseCodes.UNAUTHORIZED, res, "User isn't authorized personnel of the University.");
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
