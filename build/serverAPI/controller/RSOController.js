"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../utils/ResponseCodes");
const BaseRSOController_1 = __importDefault(require("./base/BaseRSOController"));
const RSOMemberType_1 = require("../model/internal/rsoMember/RSOMemberType");
const RSOSchema_1 = __importDefault(require("../model/internal/rso/RSOSchema"));
/**
 * This class creates several properties responsible for rso-actions
 * provided to the user.
 */
class RSOController extends BaseRSOController_1.default {
    userController;
    constructor(rsoDatabase, userController) {
        super(rsoDatabase);
        this.userController = userController;
    }
    parseRegisterRequest(req, res) {
        let request = new RSOSchema_1.default(req.body?.name, req.body?.description, req.body?.members);
        return this.verifySchema(request, res);
    }
    /**
     * Gets information about all RSOs at user's university.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req, res) => {
        // let parameters = new Map<string, any>([["universityID", req.serverUser.universityAffiliation.organizationID], ["query", req.body?.query]]);
        if (req.body?.userRSOS !== undefined && Boolean(req.body?.userRSOS)) {
            return this.requestGetAll(new Map([["userID", req.serverUser.userID.toString()]]), res).then(rso => {
                return this.send(ResponseCodes_1.ResponseCodes.OK, res, rso);
            }, (response) => response);
        }
    };
    /**
     * Gets information about RSO at specified rsoID.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req, res) => {
        let parameters = new Map([["rsoID", req.params.rsoID]]);
        try {
            let rso = await this.requestGet(parameters, res);
            let userAffiliate = req.serverUser.organizationsAffiliation
                .find((member) => member.organizationID == rso.rsoID);
            let userMember = rso.members.filter((member) => member.userID == req.serverUser.userID);
            if (userAffiliate == undefined || userMember.length == 0) {
                return this.send(ResponseCodes_1.ResponseCodes.FORBIDDEN, res, "RSO could not be accessed due to user not being affiliated with RSO.");
            }
            if (userMember[0].memberType !== RSOMemberType_1.RSOMemberType.MEMBER &&
                userMember[0].memberType !== RSOMemberType_1.RSOMemberType.ADMIN) {
                return this.send(ResponseCodes_1.ResponseCodes.FORBIDDEN, res, "RSO could not be accessed due to lack of permission.");
            }
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, rso);
        }
        catch (response) {
            return response;
        }
    };
    create = async (req, res) => {
        let rsoRegisterSchema;
        try {
            rsoRegisterSchema = await this.parseRegisterRequest(req, res);
            if (rsoRegisterSchema.members.length < 4) {
                return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "RSO should contain at least 4 members.");
            }
            let uniqueStudents = new Set();
            rsoRegisterSchema.members.forEach((member) => {
                if (uniqueStudents.has(member.userID)) {
                    return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "RSO could not be created, duplicate users has been found.");
                }
                uniqueStudents.add(member.userID);
            });
            let admin = rsoRegisterSchema.members.find((member) => member.memberType == RSOMemberType_1.RSOMemberType.ADMIN);
            if (admin === undefined) {
                return this.send(ResponseCodes_1.ResponseCodes.FORBIDDEN, res, "RSO could not be created, admin wasn't assigned.");
            }
            let adminStudent = await this.userController.requestGet(new Map([["userID", admin.userID]]), res);
            rsoRegisterSchema.members
                .filter((member) => member.memberType !== RSOMemberType_1.RSOMemberType.ADMIN)
                .forEach(async (member) => {
                let student = await this.userController.requestGet(new Map([["userID", member.userID]]), res);
                if (adminStudent.universityAffiliation.organizationName !== student.universityAffiliation.organizationName) {
                    return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "RSO could not be created, all students should attend the same univesity");
                }
            });
            let rso = await this.requestCreate(rsoRegisterSchema, res);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, rso);
        }
        catch (response) {
            return response;
        }
    };
    /**
     * Becomes a member of RSO specified by rsoID.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    enter = async (req, res) => {
        let parameters = new Map([["rsoID", req.params.rsoID]]);
        try {
            let rso = await this.requestGet(parameters, res);
            let rsoMember = rso.members.find((member) => member.userID === req.serverUser.userID);
            if (rsoMember !== undefined) {
                return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "User is already affiliated with RSO.");
            }
            let member = {
                memberType: RSOMemberType_1.RSOMemberType.MEMBER,
                userID: req.serverUser.userID,
            };
            rso.members.push(member);
            await this.requestUpdate(rso.rsoID.toString(), rso, res);
        }
        catch (response) {
            return response;
        }
    };
    /**
     * Leaves the RSO specified by rsoID.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    leave = async (req, res) => {
        let parameters = new Map([["rsoID", req.params.rsoID]]);
        try {
            let rso = await this.requestGet(parameters, res);
            let rsoMember = rso.members.find((member) => member.userID === req.serverUser.userID);
            if (rsoMember == undefined) {
                return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "User is not affiliated with RSO.");
            }
            let updatedMembers = [];
            rso.members.forEach((member) => {
                if (req.serverUser.userID !== member.userID) {
                    updatedMembers.push(member);
                }
            });
            rso.members = updatedMembers;
            await this.requestUpdate(rso.rsoID.toString(), rso, res);
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
        let parameters = new Map([["rsoID", req.params.rsoID]]);
        try {
            let rso = await this.requestGet(parameters, res);
            let userAffiliate = req.serverUser.organizationsAffiliation
                .find((member) => member.organizationID == rso.rsoID);
            let userMember = rso.members.filter((member) => member.userID == req.serverUser.userID);
            if (userAffiliate == undefined || userMember.length == 0) {
                return this.send(ResponseCodes_1.ResponseCodes.FORBIDDEN, res, "RSO could not be accessed due to user not being affiliated with RSO.");
            }
            if (userMember[0].memberType !== RSOMemberType_1.RSOMemberType.ADMIN) {
                return this.send(ResponseCodes_1.ResponseCodes.FORBIDDEN, res, "RSO could not be deleted due to lack of permission.");
            }
            let result = await this.requestDelete(rso.rsoID.toString(), res);
            if (!result) {
                return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "RSO could not be deleted.");
            }
            return this.send(ResponseCodes_1.ResponseCodes.OK, res);
        }
        catch (response) {
            return response;
        }
    };
}
exports.default = RSOController;
//# sourceMappingURL=RSOController.js.map