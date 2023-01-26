/**
 * This file is responsible for construction of the routes for UserController.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import UserController from '../controller/UserController';

import JWTAuthenticator from '../middleware/authentication/JWTAuthenticator';

import TokenCreator from '../../utils/TokenCreator';

import IIdentification from '../model/internal/user/IIdentification';

import UserDatabase from '../../database/UserDatabase';

export const userRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let username = process.env.DB_USERNAME;
let password = process.env.DB_PASSWORD;

let freeImageHostApiKey = process.env.FREE_IMAGE_HOST_API_KEY;

let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

const database = UserDatabase.connect(
    databaseURL,
    databaseName,
    username,
    password
);

const userController = new UserController(database);

userRoute.use(new JWTAuthenticator().authenticate(new TokenCreator<IIdentification>(privateKey)));

userRoute.use(express.json({ limit: '30mb' }));

userRoute.route('/')
    .get(userController.get)
    .delete(userController.delete)
    