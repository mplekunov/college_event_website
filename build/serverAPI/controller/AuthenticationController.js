"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../utils/ResponseCodes");
const Token_1 = __importDefault(require("../model/internal/token/Token"));
const UserSchema_1 = __importDefault(require("../model/internal/user/UserSchema"));
const LoginRequest_1 = __importDefault(require("../model/external/request/authentication/LoginRequest"));
const RefreshJWTRequest_1 = __importDefault(require("../model/external/request/authentication/RefreshJWTRequest"));
const RegisterRequest_1 = __importDefault(require("../model/external/request/authentication/RegisterRequest"));
const BaseUserController_1 = __importDefault(require("./base/BaseUserController"));
const JWTStorage_1 = __importDefault(require("../middleware/authentication/JWTStorage"));
const UserToken_1 = __importDefault(require("../model/internal/userToken/UserToken"));
/**
 * This class creates several properties responsible for authentication actions
 * provided to the user.
 */
class AuthenticationController extends BaseUserController_1.default {
    encryptor;
    tokenCreator;
    static verificationCodesMap = new Map();
    verificationCodeLifetimeInMilliseconds = 5 * 60 * 1000;
    maxAttemptsPerVerificationCode = 3;
    accessTokenTimeoutInSeconds = 24 * 60 * 60;
    refreshTokenTimeoutInSeconds = 24 * 60 * 60;
    minVerificationCode = 100000;
    maxVerificationCode = 999999;
    constructor(database, encryptor, tokenCreator) {
        super(database);
        this.encryptor = encryptor;
        this.tokenCreator = tokenCreator;
    }
    parseLoginRequest(req, res) {
        let request = new LoginRequest_1.default(req.body?.username, req.body?.password);
        return this.verifySchema(request, res);
        ;
    }
    parseRegisterRequest(req, res) {
        let request = new RegisterRequest_1.default(req.body?.firstName, req.body?.lastName, req.body?.username, req.body?.password, req.body?.email, UserLevel.STUDENT);
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
        if (!user.isVerified) {
            return this.send(ResponseCodes_1.ResponseCodes.FORBIDDEN, res, "Account is not verified.");
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
            await this.requestUpdate(user.username, user, res);
        }
        catch (response) {
            return response;
        }
        return this.send(ResponseCodes_1.ResponseCodes.OK, res, token);
    };
    convertToMinutes(timeInMilliseconds) {
        return Math.ceil(timeInMilliseconds / 1000 / 60);
    }
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
        let internalUser = new UserSchema_1.default(parsedRequest.firstName, parsedRequest.lastName, parsedRequest.username, parsedRequest.password, parsedRequest.email, UserLevel.STUDENT, parsedRequest.lastSeen);
        internalUser.password = await this.encryptor.encrypt(internalUser.password);
        let createdUser = await this.database.Create(internalUser);
        if (createdUser === null) {
            return this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, `User could not be created.`);
        }
        return this.send(ResponseCodes_1.ResponseCodes.CREATED, res, "User has been created.");
    };
}
exports.default = AuthenticationController;
//# sourceMappingURL=AuthenticationController.js.map