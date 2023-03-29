"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../utils/ResponseCodes");
const BaseUniversityController_1 = __importDefault(require("./base/BaseUniversityController"));
const UserLevel_1 = require("../model/internal/user/UserLevel");
/**
 * This class creates several properties responsible for rso-actions
 * provided to the user.
 */
class UniversityController extends BaseUniversityController_1.default {
    constructor(universityDatabase) {
        super(universityDatabase);
    }
    /**
     * Gets information about all universities.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req, res) => {
        let parameters = new Map([["query", req.body?.query]]);
        return this.requestGetAll(parameters, res).then(rso => {
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, rso);
        }, (response) => response);
    };
    /**
     * Gets information about University at specified university.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req, res) => {
        let parameters = new Map([["universityID", req.params?.universityID]]);
        try {
            let university = await this.requestGet(parameters, res);
            if (req.serverUser.userLevel !== UserLevel_1.UserLevel.ADMIN && req.serverUser.universityAffiliation.organizationName !== university.name) {
                return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, "You are not authorized to perform this action.");
            }
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, university);
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
        let parameters = new Map([["university", req.params?.rsoID]]);
        try {
            let rso = await this.requestGet(parameters, res);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res);
        }
        catch (response) {
            return response;
        }
    };
}
exports.default = UniversityController;
//# sourceMappingURL=UniversityController.js.map