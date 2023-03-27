"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../../utils/ResponseCodes");
const BaseUserController_1 = __importDefault(require("../../controller/base/BaseUserController"));
const JWTStorage_1 = __importDefault(require("./JWTStorage"));
class JWTAuthenticator extends BaseUserController_1.default {
    constructor(database) {
        super(database);
    }
    authenticate = (tokenCreator) => async (req, res, next) => {
        if (!req.headers.authorization) {
            return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, "Token is invalid.");
        }
        let authHeaderItems = req.headers.authorization.split(' ');
        // According to specifications, accessToken is prefixed with Bearer.
        // This logic removes Bearer if it exists.
        let accessToken = authHeaderItems.length === 2 ? authHeaderItems[1] : authHeaderItems[0];
        let userIdentification;
        try {
            userIdentification = tokenCreator.verify(accessToken.trim());
        }
        catch (error) {
            return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, this.getException(error));
        }
        if (!JWTStorage_1.default.getInstance().hasJWT(userIdentification.username) ||
            JWTStorage_1.default.getInstance().getJWT(userIdentification.username)?.accessToken.token !== accessToken) {
            return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, "Token is not assigned to the user.");
        }
        let user;
        try {
            user = await this.requestGet(new Map([["username", userIdentification.username]]), res);
        }
        catch (response) {
            return response;
        }
        req.serverUser = user;
        next();
    };
}
exports.default = JWTAuthenticator;
//# sourceMappingURL=JWTAuthenticator.js.map