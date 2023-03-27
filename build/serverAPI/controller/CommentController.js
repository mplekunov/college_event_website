"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../utils/ResponseCodes");
const bson_1 = __importDefault(require("bson"));
const BaseController_1 = __importDefault(require("./base/BaseController"));
/**
 * This class creates several properties responsible for event-actions
 * provided to the user.
 */
class CommentController extends BaseController_1.default {
    eventController;
    constructor(eventController) {
        super();
        this.eventController = eventController;
    }
    parseAddRequest(req, res) {
        let request = {
            commentID: new bson_1.default.ObjectId(),
            content: req.body?.content,
            userID: req.body?.userID
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
        let parameters = new Map([["eventID", req.params.eventID]]);
        return this.eventController.requestGet(parameters, res).then(event => {
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, event.comments);
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
        let commentID = req.params.commentID;
        try {
            let event = await this.eventController.requestGet(parameters, res);
            let comment = event.comments.find(comment => comment.commentID.toString() == commentID);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, comment);
        }
        catch (response) {
            return response;
        }
    };
    add = async (req, res) => {
        let commentCreationSchema;
        let eventID = req.params.eventID;
        try {
            commentCreationSchema = await this.parseAddRequest(req, res);
            let event = await this.eventController.requestGet(new Map([["eventID", eventID]]), res);
            event.comments.push(commentCreationSchema);
            await this.eventController.requestUpdate(eventID, event, res);
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
        let commentID = req.params.commentID;
        try {
            let event = await this.eventController.requestGet(parameters, res);
            event.comments = event.comments.filter(comment => comment.commentID.toString() != commentID);
            await this.eventController.requestUpdate(event.eventID.toString(), event, res);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, event.comments);
        }
        catch (response) {
            return response;
        }
    };
}
exports.default = CommentController;
//# sourceMappingURL=CommentController.js.map