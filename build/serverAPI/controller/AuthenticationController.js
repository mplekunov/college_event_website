"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../utils/ResponseCodes");
const Token_1 = __importDefault(require("../model/internal/token/Token"));
const LoginRequest_1 = __importDefault(require("../model/external/request/authentication/LoginRequest"));
const RefreshJWTRequest_1 = __importDefault(require("../model/external/request/authentication/RefreshJWTRequest"));
const UserRegisterRequest_1 = __importDefault(require("../model/external/request/authentication/UserRegisterRequest"));
const BaseUserController_1 = __importDefault(require("./base/BaseUserController"));
const JWTStorage_1 = __importDefault(require("../middleware/authentication/JWTStorage"));
const UserToken_1 = __importDefault(require("../model/internal/userToken/UserToken"));
const UniversityAffiliate_1 = __importDefault(require("../model/internal/affiliate/UniversityAffiliate"));
const UserLevel_1 = require("../model/internal/user/UserLevel");
const BaseUserSchema_1 = __importDefault(require("../model/internal/user/BaseUserSchema"));
const BaseUniversitySchema_1 = __importDefault(require("../model/internal/university/BaseUniversitySchema"));
const BaseLocationSchema_1 = __importDefault(require("../model/internal/location/BaseLocationSchema"));
/**
 * This class creates several properties responsible for authentication actions
 * provided to the user.
 */
class AuthenticationController extends BaseUserController_1.default {
    encryptor;
    tokenCreator;
    accessTokenTimeoutInSeconds = 24 * 60 * 60;
    refreshTokenTimeoutInSeconds = 24 * 60 * 60;
    universityController;
    constructor(database, encryptor, tokenCreator, universityController) {
        super(database);
        this.universityController = universityController;
        this.encryptor = encryptor;
        this.tokenCreator = tokenCreator;
    }
    parseLoginRequest(req, res) {
        let request = new LoginRequest_1.default(req.body?.username, req.body?.password);
        return this.verifySchema(request, res);
        ;
    }
    parseRegisterRequest(req, res) {
        let request = new UserRegisterRequest_1.default(req.body?.firstName, req.body?.lastName, req.body?.username, req.body?.password, req.body?.email, parseInt(req.body?.userLevel), new UniversityAffiliate_1.default(req.body?.university.name, parseInt(req.body?.university.affiliationType)));
        return this.verifySchema(request, res);
    }
    parseRefreshJWTRequest(req, res) {
        let request = new RefreshJWTRequest_1.default(req.body?.refreshToken);
        return this.verifySchema(request, res);
    }
    createToken(identification) {
        let accessToken = this.tokenCreator.sign(identification, this.accessTokenTimeoutInSeconds);
        let refreshToken = this.tokenCreator.sign(identification, this.refreshTokenTimeoutInSeconds);
        let currentTime = Date.now();
        let userToken = new UserToken_1.default(new Token_1.default(accessToken, currentTime, this.accessTokenTimeoutInSeconds, currentTime + this.accessTokenTimeoutInSeconds * 1000), new Token_1.default(refreshToken, currentTime, this.refreshTokenTimeoutInSeconds, currentTime + this.refreshTokenTimeoutInSeconds * 1000));
        JWTStorage_1.default.getInstance().addJWT(identification.username, userToken);
        return userToken;
    }
    /**
     * Logs client into the server using token from authorization header.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    login = async (req, res) => {
        let parsedRequest;
        let user;
        try {
            parsedRequest = await this.parseLoginRequest(req, res);
            user = await this.requestGet(new Map([["username", parsedRequest.username]]), res);
        }
        catch (response) {
            return response;
        }
        let result = await this.encryptor.compare(parsedRequest.password, user.password);
        if (!result) {
            return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, `User credentials are incorrect.`);
        }
        let token = this.createToken({ username: user.username });
        if (req.query.includeInfo === 'true') {
            return this.send(ResponseCodes_1.ResponseCodes.OK, res, {
                token,
                userInfo: this.convertToUserResponse(user)
            });
        }
        user.lastSeen = Date.now();
        try {
            await this.requestUpdate(user.userID.toString(), user, res);
        }
        catch (response) {
            return response;
        }
        return this.send(ResponseCodes_1.ResponseCodes.OK, res, token);
    };
    /**
     * Refreshes client's JWT tokens when correct refresh token is provided.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    refreshJWT = async (req, res) => {
        let parsedRequest;
        let identification;
        try {
            parsedRequest = await this.parseRefreshJWTRequest(req, res);
        }
        catch (response) {
            return response;
        }
        try {
            identification = this.tokenCreator.verify(parsedRequest.refreshToken);
        }
        catch (error) {
            return this.send(ResponseCodes_1.ResponseCodes.UNAUTHORIZED, res, "Refresh token is invalid.");
        }
        return this.send(ResponseCodes_1.ResponseCodes.OK, res, this.createToken({ username: identification.username }));
    };
    /**
     * Logs client out from the server. All JWT tokens related to the client becomes invalid.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    logout = async (req, res) => {
        try {
            JWTStorage_1.default.getInstance().deleteJWT(req.serverUser.username);
            return this.send(ResponseCodes_1.ResponseCodes.OK, res);
        }
        catch (error) {
            return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, "Could not perform logout operation.");
        }
    };
    parseRegisterUniversityRequest(req, res) {
        let request = new BaseUniversitySchema_1.default(req.body?.university?.name, req.body?.university?.description, new BaseLocationSchema_1.default(req.body?.university?.location?.address, parseFloat(req.body?.university?.location?.longitude), parseFloat(req.body?.university?.location?.latitude)), req.body?.university?.numStudents);
        return this.verifySchema(request, res);
    }
    /**
     * Registers client account on the server.
     *
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    register = async (req, res) => {
        let parsedRequest;
        let userExists;
        let emailExists;
        try {
            parsedRequest = await this.parseRegisterRequest(req, res);
            userExists = await this.usernameExists(parsedRequest.username, res);
            emailExists = await this.emailExists(parsedRequest.email, res);
        }
        catch (response) {
            return response;
        }
        if (userExists) {
            return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, `User with such username already exists.`);
        }
        if (emailExists) {
            return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, `User with such email already exists.`);
        }
        let internalUser = new BaseUserSchema_1.default(parsedRequest.firstName, parsedRequest.lastName, parsedRequest.username, parsedRequest.password, parsedRequest.email, parsedRequest.userLevel, parsedRequest.lastSeen, parsedRequest.universityAffiliation);
        if (internalUser.userLevel === UserLevel_1.UserLevel.ADMIN) {
            let universitySchema;
            try {
                universitySchema = await this.parseRegisterUniversityRequest(req, res);
                await this.universityController.requestCreate(universitySchema, res);
            }
            catch (response) {
                return response;
            }
        }
        internalUser.password = await this.encryptor.encrypt(internalUser.password);
        try {
            let createdUser = await this.database.Create(internalUser);
            if (createdUser === null) {
                return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, `User could not be created.`);
            }
        }
        catch (error) {
            return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, error);
        }
        return this.send(ResponseCodes_1.ResponseCodes.CREATED, res, "User has been created.");
    };
}
exports.default = AuthenticationController;
//# sourceMappingURL=AuthenticationController.js.map