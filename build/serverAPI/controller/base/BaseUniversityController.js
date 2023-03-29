"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../../utils/ResponseCodes");
const BaseController_1 = __importDefault(require("./BaseController"));
class BaseUniversityController extends BaseController_1.default {
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
    async requestCreate(university, res) {
        return this.database.Create(university).then(createdUniversity => {
            if (createdUniversity === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "University could not be created."));
            }
            return createdUniversity;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestUpdate(id, university, res) {
        return this.database.Update(id, university).then(updatedUniversity => {
            if (updatedUniversity === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "University could not be updated."));
            }
            return updatedUniversity;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestDelete(id, res) {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "University could not be deleted."));
            }
            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestGetAll(parameters, res) {
        try {
            let promiseList = await this.database.GetAll(parameters);
            if (promiseList === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Universities could not be found."));
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
        return this.database.Get(parameters).then(async (university) => {
            if (university === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.NOT_FOUND, res, "University could not be found."));
            }
            return university;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
exports.default = BaseUniversityController;
//# sourceMappingURL=BaseUniversityController.js.map