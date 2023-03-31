"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../utils/ResponseCodes");
const bson_1 = __importDefault(require("bson"));
const BaseEventController_1 = __importDefault(require("./base/BaseEventController"));
const RSOMemberType_1 = require("../model/internal/rsoMember/RSOMemberType");
/**
 * This class creates several properties responsible for event-actions
 * provided to the user.
 */
class EventController extends BaseEventController_1.default {
    userController;
    constructor(eventDatabase, userController) {
        super(eventDatabase);
        this.userController = userController;
    }
    parseRegisterRequest(req, res) {
        let request = {
            eventID: new bson_1.default.ObjectId(),
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
    getAll = async (req, res) => {
        let parameters = new Map([["host", req.body?.host]]);
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
    add = async (req, res) => {
        let eventCreationSchema;
        try {
            eventCreationSchema = await this.parseRegisterRequest(req, res);
            let event = await this.requestCreate(eventCreationSchema, res);
            this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, event);
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
        let studentID = req.body?.studentID;
        try {
            let event = await this.requestGet(parameters, res);
            let student = await this.userController.requestGet(new Map([["studentID", studentID]]), res);
            if (event.host.hostType == HostType.RSO &&
                student.organizationsAffiliation
                    .find(org => org.affiliationType.memberType == RSOMemberType_1.RSOMemberType.ADMIN) == undefined ||
                event.host.hostType == HostType.UNIVERSITY &&
                    student.universityAffiliation.affiliationType.memberType != UniversityMemberType.STAFF) {
                return this.send(ResponseCodes_1.ResponseCodes.FORBIDDEN, res, "User doesn't have permission for event removal.");
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