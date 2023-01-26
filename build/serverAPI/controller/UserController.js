"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../utils/ResponseCodes");
const JWTStorage_1 = __importDefault(require("../middleware/authentication/JWTStorage"));
const BaseUserController_1 = __importDefault(require("./base/BaseUserController"));
/**
 * This class creates several properties responsible for user-actions
 * provided to the user.
 */
class UserController extends BaseUserController_1.default {
    constructor(database) {
        super(database);
    }
    /**
     * Gets information about user at specified userID.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req, res) => {
        let parameters = new Map([["username", req.serverUser.username]]);
        return this.requestGet(parameters, res).then(user => {
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, this.convertToUserResponse(user));
        }, (response) => response);
    };
    /**
     * Deletes user object at specified userID.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req, res) => {
        let parameters = new Map([["username", req.serverUser.username]]);
        try {
            let user = await this.requestGet(parameters, res);
            let result = await this.requestDelete(req.serverUser.username, res);
            if (!result) {
                return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "User could not be deleted.");
            }
            JWTStorage_1.default.getInstance().deleteJWT(user.username);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res);
        }
        catch (response) {
            return response;
        }
    };
}
exports.default = UserController;
//# sourceMappingURL=UserController.js.map