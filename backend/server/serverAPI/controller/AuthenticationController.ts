import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import Encryptor from "../../utils/Encryptor";
import TokenCreator from "../../utils/TokenCreator";

import Token from "../model/internal/token/Token";

import LoginRequestSchema from "../model/external/request/authentication/LoginRequest";
import RefreshJWTRequestSchema from "../model/external/request/authentication/RefreshJWTRequest";
import UserRegisterRequestSchema from "../model/external/request/authentication/UserRegisterRequest";

import IDatabase from "../../database/IDatabase";
import IIdentification from "../model/internal/user/IIdentification";
import IUser from "../model/internal/user/IUser";

import BaseUserController from "./base/BaseUserController";

import JWTStorage from "../middleware/authentication/JWTStorage";
import UserToken from "../model/internal/userToken/UserToken";
import IBaseUser from "../model/internal/user/IBaseUser";
import BaseUniversityAffiliateSchema from "../model/internal/affiliate/UniversityAffiliate";
import { UserLevel } from "../model/internal/user/UserLevel";
import BaseUserSchema from "../model/internal/user/BaseUserSchema";
import BaseUniversitySchema from "../model/internal/university/BaseUniversitySchema";
import BaseLocationSchema from "../model/internal/location/BaseLocationSchema";
import UniversityController from "./UniversityController";
import { ObjectId } from "bson";
import IBaseAffiliate from "../model/internal/affiliate/IBaseAffiliate";
import { validate } from 'class-validator';

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class AuthenticationController extends BaseUserController {
    private encryptor: Encryptor;
    private tokenCreator: TokenCreator<IIdentification>;

    protected accessTokenTimeoutInSeconds = 24 * 60 * 60;
    protected refreshTokenTimeoutInSeconds = 24 * 60 * 60;

    private universityController: UniversityController;

    constructor(
        database: IDatabase<IBaseUser, IUser>,
        encryptor: Encryptor,
        tokenCreator: TokenCreator<IIdentification>,
        universityController: UniversityController
    ) {
        super(database);

        this.universityController = universityController;

        this.encryptor = encryptor;
        this.tokenCreator = tokenCreator;
    }

    protected parseUserLoginRequest(req: Request, res: Response): Promise<LoginRequestSchema> {
        let request = new LoginRequestSchema(
            req.body?.username,
            req.body?.password
        );

        return this.verifySchema(request, res);;
    }

    protected parseUniversityRegisterRequest(req: Request, res: Response): Promise<BaseUniversitySchema> {
        let request = new BaseUniversitySchema(
            req.body?.university?.name,
            req.body?.university?.description,
            new BaseLocationSchema(
                req.body?.university?.location?.address,
                parseFloat(req.body?.university?.location?.longitude),
                parseFloat(req.body?.university?.location?.latitude)
            ),
            parseInt(req.body?.university?.numStudents)
        );

        return this.verifySchema(request, res);
    }

    protected parseUniversityRegisterAffiliateRequest(req: Request, res: Response): Promise<BaseUniversityAffiliateSchema> {
        let request = new BaseUniversityAffiliateSchema(
            req.body?.university?.name,
            req.body?.university?.universityID
        );

        return this.verifySchema(request, res);
    }

    protected parseUserRegisterRequest(req: Request, res: Response): Promise<UserRegisterRequestSchema> {
        let request = new UserRegisterRequestSchema(
            req.body?.firstName,
            req.body?.lastName,
            req.body?.username,
            req.body?.password,
            req.body?.email,
            parseInt(req.body?.userLevel) as UserLevel
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
            parsedRequest = await this.parseUserLoginRequest(req, res);
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
            await this.requestUpdate(user.userID.toString(), user, res);
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
        let parsedUserRequest: UserRegisterRequestSchema;
        let userExists: boolean;
        let emailExists: boolean;

        try {
            parsedUserRequest = await this.parseUserRegisterRequest(req, res);
            userExists = await this.usernameExists(parsedUserRequest.username, res);
            emailExists = await this.emailExists(parsedUserRequest.email, res);
        } catch (response) {
            return response;
        }

        if (userExists) {
            return this.send(ResponseCodes.BAD_REQUEST, res, `User with such username already exists.`);
        }

        if (emailExists) {
            return this.send(ResponseCodes.BAD_REQUEST, res, `User with such email already exists.`);
        }

        let universityAffiliate: IBaseAffiliate;

        if (parsedUserRequest.userLevel === UserLevel.SUPER_ADMIN) {
            let universitySchema: BaseUniversitySchema;

            let university;
            try {
                universitySchema = await this.parseUniversityRegisterRequest(req, res);

                console.log(universitySchema);

                university = await this.universityController.requestCreate(universitySchema, res);
            } catch (response) {

                console.log(response);
                return response;
            }

            universityAffiliate = {
                organizationID: university.universityID,
                organizationName: university.name,
            };
        } else {
            universityAffiliate = await this.parseUniversityRegisterAffiliateRequest(req, res);
        }

        let internalUser = new BaseUserSchema(
            parsedUserRequest.firstName,
            parsedUserRequest.lastName,
            parsedUserRequest.username,
            parsedUserRequest.password,
            parsedUserRequest.email,
            parsedUserRequest.userLevel,
            parsedUserRequest.lastSeen,
            universityAffiliate
        );

        internalUser.password = await this.encryptor.encrypt(internalUser.password);

        try {
            let createdUser = await this.database.Create(internalUser);

            if (createdUser === null) {
                return this.send(ResponseCodes.BAD_REQUEST, res, `User could not be created.`);
            }
        } catch (error) {
            return this.send(ResponseCodes.BAD_REQUEST, res, error);
        }

        return this.send(ResponseCodes.CREATED, res, "User has been created.");
    }
}
