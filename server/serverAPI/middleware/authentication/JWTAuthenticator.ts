import { Request, Response, NextFunction } from 'express';

import IDatabase from '../../../database/IDatabase';

import { ResponseCodes } from '../../../utils/ResponseCodes';

import TokenCreator from '../../../utils/TokenCreator';

import BaseUserController from '../../controller/base/BaseUserController';
import IBaseUser from '../../model/internal/user/IBaseUser';

import IIdentification from '../../model/internal/user/IIdentification';
import IUser from '../../model/internal/user/IUser';

import JWTStorage from './JWTStorage';

export default class JWTAuthenticator extends BaseUserController {
    constructor(database: IDatabase<IBaseUser, IUser>) {
        super(database);
    }

    authenticate = (tokenCreator: TokenCreator<IIdentification>) =>
        async (req: Request, res: Response, next: NextFunction) => {
            if (!req.headers.authorization) {
                return this.send(ResponseCodes.UNAUTHORIZED, res, "Token is invalid.");
            }

            let authHeaderItems = req.headers.authorization.split(' ');

            // According to specifications, accessToken is prefixed with Bearer.
            // This logic removes Bearer if it exists.
            let accessToken: string = authHeaderItems.length === 2 ? authHeaderItems[1] : authHeaderItems[0];

            let userIdentification: IIdentification;
            try {
                userIdentification = tokenCreator.verify(accessToken.trim());
            } catch (error) {
                return this.send(ResponseCodes.UNAUTHORIZED, res, this.getException(error));
            }

            if (!JWTStorage.getInstance().hasJWT(userIdentification.username) ||
                JWTStorage.getInstance().getJWT(userIdentification.username)?.accessToken.token !== accessToken
            ) {
                return this.send(ResponseCodes.UNAUTHORIZED, res, "Token is not assigned to the user.");
            }

            let user: IUser;
            try {
                user = await this.requestGet(new Map<string, string>([["username", userIdentification.username]]), res);
            } catch (response) {
                return response;
            }

            req.serverUser = user;
            
            next();
        }
}
