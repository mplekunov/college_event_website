"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../utils/ResponseCodes");
const bson_1 = require("bson");
const BaseCommentController_1 = __importDefault(require("./base/BaseCommentController"));
const BaseCommentSchema_1 = __importDefault(require("../model/internal/comment/BaseCommentSchema"));
/**
 * This class creates several properties responsible for event-actions
 * provided to the user.
 */
class CommentController extends BaseCommentController_1.default {
    eventController;
    constructor(eventDatabase, eventController) {
        super(eventDatabase);
        this.eventController = eventController;
    }
    parseRegisterRequest(req, res) {
        let request = new BaseCommentSchema_1.default(req.body?.content, req.serverUser.userID, new bson_1.ObjectId(req.params?.eventID));
        return this.verifySchema(request, res);
    }
    /**
     * Gets information about all RSOs at user's university.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req, res) => {
        let parameters = new Map([["eventID", req.params?.eventID]]);
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
        let parameters = new Map([["commentID", req.params.commentID]]);
        try {
            let comment = await this.requestGet(parameters, res);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, comment);
        }
        catch (response) {
            return response;
        }
    };
    create = async (req, res) => {
        let commentCreationSchema;
        try {
            commentCreationSchema = await this.parseRegisterRequest(req, res);
            let event = await this.eventController.requestGet(new Map([["eventID", commentCreationSchema.eventID]]), res);
            if (event === undefined) {
                return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Event doesn't exist.");
            }
            let comment = await this.requestCreate(commentCreationSchema, res);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, comment);
        }
        catch (response) {
            return response;
        }
    };
    update = async (req, res) => {
        let parameters = new Map([["commentID", req.params.commentID]]);
        try {
            let comment = await this.requestGet(parameters, res);
            if (comment === undefined) {
                return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Comment doesn't exist.");
            }
            if (!comment.userID.equals(req.serverUser.userID)) {
                return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, "You are not authorized to update this comment.");
            }
            let commentUpdateSchema = new BaseCommentSchema_1.default(req.body?.content, req.serverUser.userID, comment.eventID);
            this.verifySchema(commentUpdateSchema, res);
            let updatedComment = await this.requestUpdate(req.params.commentID, commentUpdateSchema, res);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, updatedComment);
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
        let parameters = new Map([["commentID", req.params.commentID]]);
        try {
            let comment = await this.requestGet(parameters, res);
            if (comment === undefined) {
                return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Comment doesn't exist.");
            }
            if (!comment.userID.equals(req.serverUser.userID)) {
                return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, "You are not authorized to delete this comment.");
            }
            await this.requestDelete(req.params.commentID, res);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, "Comment has been deleted.");
        }
        catch (response) {
            return response;
        }
    };
}
exports.default = CommentController;
//# sourceMappingURL=CommentController.js.map