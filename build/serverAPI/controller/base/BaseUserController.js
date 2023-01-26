"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../../utils/ResponseCodes");
const BaseController_1 = __importDefault(require("./BaseController"));
class BaseUserController extends BaseController_1.default {
    database;
    constructor(database) {
        super();
        this.database = database;
    }
    convertToUserResponse(user) {
        return {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen,
            email: user.email,
            userLevel: user.userLevel
        };
    }
    async usernameExists(username, res) {
        return this.database.Get(new Map([["username", username]])).then(async (user) => {
            return Promise.resolve(user !== null);
        }, (error) => {
            return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, error));
        });
    }
    async emailExists(email, res) {
        return this.database.Get(new Map([["email", email]])).then(async (user) => {
            return Promise.resolve(user !== null);
        }, (error) => {
            return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, error));
        });
    }
    async requestCreate(user, res) {
        return this.database.Create(user).then(createdUser => {
            if (createdUser === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "User could not be created."));
            }
            return createdUser;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestUpdate(id, user, res) {
        return this.database.Update(id, user).then(updatedUser => {
            if (updatedUser === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "User could not be updated."));
            }
            return updatedUser;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestDelete(id, res) {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "User could not be deleted."));
            }
            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
    async requestGet(parameters, res) {
        return this.database.Get(parameters).then(async (user) => {
            if (user === null) {
                return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.NOT_FOUND, res, "User could not be found."));
            }
            return user;
        }, (error) => Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
exports.default = BaseUserController;
//# sourceMappingURL=BaseUserController.js.map