"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../../utils/ResponseCodes");
const BaseController_1 = __importDefault(require("../../controller/base/BaseController"));
const JWTStorage_1 = __importDefault(require("./JWTStorage"));
class JWTAuthenticator extends BaseController_1.default {
    authenticate = (tokenCreator) => (req, res, next) => {
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
        req.serverUser = userIdentification;
        next();
    };
}
exports.default = JWTAuthenticator;
//# sourceMappingURL=JWTAuthenticator.js.map