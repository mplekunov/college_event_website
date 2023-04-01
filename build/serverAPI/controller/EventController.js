"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../utils/ResponseCodes");
const RSOMemberType_1 = require("../model/internal/rsoMember/RSOMemberType");
const UserLevel_1 = require("../model/internal/user/UserLevel");
const HostType_1 = require("../model/internal/host/HostType");
const bson_1 = require("bson");
const BaseEventController_1 = __importDefault(require("./base/BaseEventController"));
const BaseEventSchema_1 = __importDefault(require("../model/internal/event/BaseEventSchema"));
const BaseLocationSchema_1 = __importDefault(require("../model/internal/location/BaseLocationSchema"));
/**
 * This class creates several properties responsible for event-actions
 * provided to the user.
 */
class EventController extends BaseEventController_1.default {
    rsoController;
    universityController;
    constructor(eventDatabase, rsoController, universityController) {
        super(eventDatabase);
        this.rsoController = rsoController;
        this.universityController = universityController;
    }
    parseRegisterRequest(req, res) {
        let request = new BaseEventSchema_1.default(req.body?.name, new bson_1.ObjectId(req.body?.hostID), parseInt(req.body?.hostType), req.body?.category, req.body?.description, parseInt(req.body?.date), new BaseLocationSchema_1.default(req.body?.location?.address, parseFloat(req.body?.location?.longitude), parseFloat(req.body?.location?.latitude)), req.body?.email, req.body?.phone);
        return this.verifySchema(request, res);
    }
    /**
     * Gets information about all RSOs at user's university.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req, res) => {
        let parameters = new Map([["hostID", req.body?.hostID], ["hostType", parseInt(req.body?.hostType)]]);
        return this.requestGetAll(parameters, res).then(rso => {
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, rso);
        }, (response) => response);
    };
    /**
     * Gets information about RSO at specified rsoID.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req, res) => {
        let parameters = new Map([["eventID", req.params.eventID]]);
        try {
            let event = await this.requestGet(parameters, res);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, event);
        }
        catch (response) {
            return response;
        }
    };
    create = async (req, res) => {
        let eventCreationSchema;
        try {
            eventCreationSchema = await this.parseRegisterRequest(req, res);
            switch (eventCreationSchema.hostType) {
                case HostType_1.HostType.PUBLIC:
                    break;
                case HostType_1.HostType.UNIVERSITY:
                    break;
                case HostType_1.HostType.RSO:
                    let rso = await this.rsoController.requestGet(new Map([["rsoID", eventCreationSchema.hostID]]), res);
                    let member = rso.members.find((member) => member.userID.equals(req.serverUser.userID));
                    if (member === undefined) {
                        return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "User is not in the RSO.");
                    }
                    break;
                default:
                    break;
            }
            let event = await this.requestCreate(eventCreationSchema, res);
            return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, event);
        }
        catch (response) {
            return response;
        }
    };
    /**
     * Deletes rso object at specified rsoID.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req, res) => {
        let parameters = new Map([["eventID", req.params.eventID]]);
        try {
            let event = await this.requestGet(parameters, res);
            switch (event.hostType) {
                case HostType_1.HostType.RSO:
                    let rso = await this.rsoController.requestGet(new Map([["rsoID", event.hostID]]), res);
                    let member = rso.members.find((member) => member.userID.equals(req.serverUser.userID));
                    if (member === undefined) {
                        return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "User is not in the RSO.");
                    }
                    if (member.memberType !== RSOMemberType_1.RSOMemberType.ADMIN) {
                        return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, "User doesn't have enough permissions.");
                    }
                    break;
                case HostType_1.HostType.PUBLIC:
                    if (!req.serverUser.userID.equals(event.hostID)) {
                        return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, "User doesn't have enough permissions.");
                    }
                    break;
                case HostType_1.HostType.UNIVERSITY:
                    let university = await this.universityController.requestGet(new Map([["universityID", event.hostID]]), res);
                    if (!university.universityID.equals(req.serverUser.universityAffiliation.organizationID) ||
                        req.serverUser.userLevel !== UserLevel_1.UserLevel.SUPER_ADMIN) {
                        return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, "User doesn't have enough permissions.");
                    }
                    break;
                default:
                    break;
            }
            await this.requestDelete(event.eventID.toString(), res);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res);
        }
        catch (response) {
            return response;
        }
    };
}
exports.default = EventController;
//# sourceMappingURL=EventController.js.map