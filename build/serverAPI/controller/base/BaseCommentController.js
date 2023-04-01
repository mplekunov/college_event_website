"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../../utils/ResponseCodes");
const BaseController_1 = __importDefault(require("./BaseController"));
class BaseCommentController extends BaseController_1.default {
    database;
    /**
     *
     * event can be public, private, or an RSO event.
     */
    constructor(database) {
        super();
        this.database = database;
    }
    async requestCreate(comment, res) {
        return this.database.Create(comment).then(createdComment => {
            if (createdComment === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Comment could not be created."));
            }
            return createdComment;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestUpdate(id, comment, res) {
        return this.database.Update(id, comment).then(updatedComment => {
            if (updatedComment === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Comment could not be updated."));
            }
            return updatedComment;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestDelete(id, res) {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Comment could not be deleted."));
            }
            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestGetAll(parameters, res) {
        try {
            let promiseList = await this.database.GetAll(parameters);
            if (promiseList === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Comments could not be found."));
            }
            let objects = [];
            for (const promise of promiseList) {
                let obj = await promise;
                if (obj !== null) {
                    objects.push(obj);
                }
            }
            return objects;
        }
        catch (error) {
            return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error)));
        }
    }
    async requestGet(parameters, res) {
        return this.database.Get(parameters).then(async (comment) => {
            if (comment === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.NOT_FOUND, res, "Comment could not be found."));
            }
            return comment;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
exports.default = BaseCommentController;
//# sourceMappingURL=BaseCommentController.js.map