/**
 * This file is responsible for construction of the routes for AuthenticationController.
 */

import express from 'express';

import AuthenticationController from '../controller/AuthenticationController';

import UserDatabase from '../../database/UserDatabase';

import Encryptor from '../../utils/Encryptor';
import TokenCreator from '../../utils/TokenCreator';

import JWTAuthenticator from '../middleware/authentication/JWTAuthenticator';
import UniversityDatabase from '../../database/UniversityDatabase';
import LocationDatabase from '../../database/LocationDatabase';
import UniversityController from '../controller/UniversityController';

export const authenticationRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let username = process.env.DB_USERNAME;
let password = process.env.DB_PASSWORD;

let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

const universityDatabase = UniversityDatabase.connect(
    databaseURL,
    databaseName,
    username,
    password,
    LocationDatabase.connect(
        databaseURL,
        databaseName,
        username,
        password
    )
); 

const userDatabase = UserDatabase.connect(
    databaseURL,
    databaseName,
    username,
    password,
    universityDatabase  
);

const authenticationController = new AuthenticationController(
    userDatabase,
    new Encryptor(),
    new TokenCreator(privateKey),
    new UniversityController(universityDatabase)
);

const authenticator = new JWTAuthenticator(userDatabase).authenticate(new TokenCreator(privateKey));

authenticationRoute.use(express.json({ limit: '30mb' }));

authenticationRoute.post("/login", authenticationController.login);
authenticationRoute.post("/register", authenticationController.register);
authenticationRoute.get("/logout", authenticator, authenticationController.logout);

authenticationRoute.post("/refreshJWT", authenticationController.refreshJWT);
