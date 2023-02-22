import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import Encryptor from "../../utils/Encryptor";
import TokenCreator from "../../utils/TokenCreator";

import Token from "../model/internal/token/Token";

import LoginRequestSchema from "../model/external/request/authentication/LoginRequest";
import RefreshJWTRequestSchema from "../model/external/request/authentication/RefreshJWTRequest";
import RegisterRequestSchema from "../model/external/request/authentication/RegisterRequest";

import IDatabase from "../../database/IDatabase";
import IIdentification from "../model/internal/user/IIdentification";
import IUser from "../model/internal/user/IUser";

import BaseUserController from "./base/BaseUserController";

import JWTStorage from "../middleware/authentication/JWTStorage";
import UserToken from "../model/internal/userToken/UserToken";
import IBaseUser from "../model/internal/user/IBaseUser";
import BaseUserSchema from "../model/internal/user/BaseUserSchema";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class AuthenticationController extends BaseUserController {
    private encryptor: Encryptor;
    private tokenCreator: TokenCreator<IIdentification>;

    protected accessTokenTimeoutInSeconds = 24 * 60 * 60;
    protected refreshTokenTimeoutInSeconds = 24 * 60 * 60;

    constructor(
        database: IDatabase<IBaseUser, IUser>,
        encryptor: Encryptor,
        tokenCreator: TokenCreator<IIdentification>
    ) {
        super(database);

        this.encryptor = encryptor;
        this.tokenCreator = tokenCreator;
    }

    protected parseLoginRequest(req: Request, res: Response): Promise<LoginRequestSchema> {
        let request = new LoginRequestSchema(
            req.body?.username,
            req.body?.password
        );

        return this.verifySchema(request, res);;
    }


    protected parseRegisterRequest(req: Request, res: Response): Promise<RegisterRequestSchema> {
        let request = new RegisterRequestSchema(
            req.body?.firstName,
            req.body?.lastName,
            req.body?.username,
            req.body?.password,
            req.body?.email,
            UserLevel.STUDENT,
            req.body?.universityAffiliation
        );

        return this.verifySchema(request, res);
    }

    protected parseRefreshJWTRequest(req: Request, res: Response): Promise<RefreshJWTRequestSchema> {
        let request = new RefreshJWTRequestSchema(req.body?.refreshToken);

        return this.verifySchema(request, res);
    }

    protected createToken(identification: IIdentification): UserToken {
        let accessToken = this.tokenCreator.sign(identification, this.accessTokenTimeoutInSeconds);
        let refreshToken = this.tokenCreator.sign(identification, this.refreshTokenTimeoutInSeconds);

        let currentTime = Date.now();

        let userToken = new UserToken(
            new Token(accessToken, currentTime, this.accessTokenTimeoutInSeconds, currentTime + this.accessTokenTimeoutInSeconds * 1000),
            new Token(refreshToken, currentTime, this.refreshTokenTimeoutInSeconds, currentTime + this.refreshTokenTimeoutInSeconds * 1000)
        );

        JWTStorage.getInstance().addJWT(
            identification.username,
            userToken
        );

        return userToken;
    }
 
    /**
     * Logs client into the server using token from authorization header.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    login = async (req: Request, res: Response) => {
        let parsedRequest: LoginRequestSchema;
        let user: IUser;

        try {
            parsedRequest = await this.parseLoginRequest(req, res);
            user = await this.requestGet(new Map([["username", parsedRequest.username]]), res);
        } catch (response) {
            return response;
        }

        let result = await this.encryptor.compare(parsedRequest.password, user.password);

        if (!result) {
            return this.send(ResponseCodes.UNAUTHORIZED, res, `User credentials are incorrect.`);
        }

        let token = this.createToken({ username: user.username });

        if (req.query.includeInfo === 'true') {
            return this.send(ResponseCodes.OK, res, {
                token,
                userInfo: this.convertToUserResponse(user)
            });
        }

        user.lastSeen = Date.now();

        try {
            await this.requestUpdate(user.username, user, res);
        } catch (response) {
            return response;
        }

        return this.send(ResponseCodes.OK, res, token);
    }

    /**
     * Refreshes client's JWT tokens when correct refresh token is provided.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    refreshJWT = async (req: Request, res: Response) => {
        let parsedRequest: RefreshJWTRequestSchema;
        let identification: IIdentification;

        try {
            parsedRequest = await this.parseRefreshJWTRequest(req, res);
        } catch (response) {
            return response;
        }

        try {
            identification = this.tokenCreator.verify(parsedRequest.refreshToken);
        } catch (error) {
            return this.send(ResponseCodes.UNAUTHORIZED, res, "Refresh token is invalid.");
        }

        return this.send(ResponseCodes.OK, res, this.createToken({ username: identification.username }));
    }

    /**
     * Logs client out from the server. All JWT tokens related to the client becomes invalid.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    logout = async (req: Request, res: Response) => {
        try {
            JWTStorage.getInstance().deleteJWT(req.serverUser.username);
            return this.send(ResponseCodes.OK, res);
        } catch (error) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Could not perform logout operation.");
        }
    }

    /**
     * Registers client account on the server.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    register = async (req: Request, res: Response) => {
        let parsedRequest: RegisterRequestSchema;
        let userExists: boolean;
        let emailExists: boolean;

        try {
            parsedRequest = await this.parseRegisterRequest(req, res);
            userExists = await this.usernameExists(parsedRequest.username, res);
            emailExists = await this.emailExists(parsedRequest.email, res);
        } catch (response) {
            return response;
        }

        if (userExists) {
            return this.send(ResponseCodes.BAD_REQUEST, res, `User with such username already exists.`);
        }

        if (emailExists) {
            return this.send(ResponseCodes.BAD_REQUEST, res, `User with such email already exists.`);
        }

        let internalUser = new BaseUserSchema(
            parsedRequest.firstName,
            parsedRequest.lastName,
            parsedRequest.username,
            parsedRequest.password,
            parsedRequest.email,
            UserLevel.STUDENT,
            parsedRequest.lastSeen,
            parsedRequest.universityAffiliation
        );

        internalUser.password = await this.encryptor.encrypt(internalUser.password);

        let createdUser = await this.database.Create(internalUser);

        if (createdUser === null) {
            return this.send(ResponseCodes.BAD_REQUEST, res, `User could not be created.`);
        }

        return this.send(ResponseCodes.CREATED, res, "User has been created.");
    }
}
