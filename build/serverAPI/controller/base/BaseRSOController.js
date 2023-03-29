"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../../utils/ResponseCodes");
const BaseController_1 = __importDefault(require("./BaseController"));
class BaseRSOController extends BaseController_1.default {
    database;
    constructor(database) {
        super();
        this.database = database;
    }
    async rsoExists(name, res) {
        return this.database.Get(new Map([["name", name]])).then(async (rso) => {
            return Promise.resolve(rso !== null);
        }, (error) => {
            return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, error));
        });
    }
    async requestCreate(rso, res) {
        return this.database.Create(rso).then(createdRSO => {
            if (createdRSO === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "RSO could not be created."));
            }
            return createdRSO;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestUpdate(id, rso, res) {
        return this.database.Update(id, rso).then(updatedRSO => {
            if (updatedRSO === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "RSO could not be updated."));
            }
            return updatedRSO;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestDelete(id, res) {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "RSO could not be deleted."));
            }
            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestGetAll(parameters, res) {
        try {
            let promiseList = await this.database.GetAll(parameters);
            console.log(promiseList);
            if (promiseList === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "RSO could not be found."));
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
        return this.database.Get(parameters).then(async (rso) => {
            if (rso === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.NOT_FOUND, res, "RSO could not be found."));
            }
            return rso;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
exports.default = BaseRSOController;
//# sourceMappingURL=BaseRSOController.js.map