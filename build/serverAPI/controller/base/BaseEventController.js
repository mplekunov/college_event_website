"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../../utils/ResponseCodes");
const BaseController_1 = __importDefault(require("./BaseController"));
class BaseEventController extends BaseController_1.default {
    database;
    /**
     *
     * event can be public, private, or an RSO event.
     */
    constructor(database) {
        super();
        this.database = database;
    }
    async requestCreate(event, res) {
        return this.database.Create(event).then(createdEvent => {
            if (createdEvent === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Event could not be created."));
            }
            return createdEvent;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestUpdate(id, event, res) {
        return this.database.Update(id, event).then(updatedRSO => {
            if (updatedRSO === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Event could not be updated."));
            }
            return updatedRSO;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestDelete(id, res) {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Event could not be deleted."));
            }
            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestGetAll(parameters, res) {
        try {
            let promiseList = await this.database.GetAll(parameters);
            if (promiseList === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Events could not be found."));
            }
            let objects = [];
            promiseList.forEach(async (promise) => {
                let obj = await promise;
                if (obj !== null) {
                    objects.push(obj);
                }
            });
            return objects;
        }
        catch (error) {
            return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error)));
        }
    }
    async requestGet(parameters, res) {
        return this.database.Get(parameters).then(async (event) => {
            if (event === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.NOT_FOUND, res, "Event could not be found."));
            }
            return event;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
exports.default = BaseEventController;
//# sourceMappingURL=BaseEventController.js.map