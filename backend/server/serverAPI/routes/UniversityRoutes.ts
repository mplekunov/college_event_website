/**
 * This file is responsible for construction of the routes for UserController.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import JWTAuthenticator from '../middleware/authentication/JWTAuthenticator';

import TokenCreator from '../../utils/TokenCreator';

import IIdentification from '../model/internal/user/IIdentification';

import UserDatabase from '../../database/UserDatabase';
import UniversityDatabase from '../../database/UniversityDatabase';
import LocationDatabase from '../../database/LocationDatabase';
import UniversityController from '../controller/UniversityController';

export const universityRoute = express.Router();

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

const universityController = new UniversityController(universityDatabase);

universityRoute.use(express.json({ limit: '30mb' }));

universityRoute.route('/')
    .get(universityController.getAll)

universityRoute.route('/:universityID')
    .get(universityController.get)
    .delete(new JWTAuthenticator(userDatabase).authenticate(new TokenCreator<IIdentification>(privateKey)), universityController.delete);
