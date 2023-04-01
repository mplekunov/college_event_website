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
import EventController from '../controller/EventController';
import EventDatabase from '../../database/EventDatabase';
import UniversityDatabase from '../../database/UniversityDatabase';
import LocationDatabase from '../../database/LocationDatabase';
import RSOController from '../controller/RSOController';
import RSODatabase from '../../database/RSODatabase';
import BaseUserController from '../controller/base/BaseUserController';
import BaseUniversityController from '../controller/base/BaseUniversityController';
import CommentController from '../controller/CommentController';
import BaseEventController from '../controller/base/BaseEventController';
import CommentDatabase from '../../database/CommentDatabase';

export const eventRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let username = process.env.DB_USERNAME;
let password = process.env.DB_PASSWORD;

let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

const locationDatabase = LocationDatabase.connect(
    databaseURL,
    databaseName,
    username,
    password
);

const universityDatabase =  UniversityDatabase.connect(
    databaseURL,
    databaseName,
    username,
    password,
    locationDatabase  
);

const userDatabase = UserDatabase.connect(
    databaseURL,
    databaseName,
    username,
    password,
    universityDatabase
);

const rsoDatabase = RSODatabase.connect(
    databaseURL,
    databaseName,
    username,
    password
);

const eventDatabase = EventDatabase.connect(
    databaseURL,
    databaseName,
    username,
    password,
    locationDatabase
);

const commentDatabase = CommentDatabase.connect(
    databaseURL,
    databaseName,
    username,
    password,
    eventDatabase,
    userDatabase
);

const eventController = new EventController(eventDatabase, new RSOController(rsoDatabase, new BaseUserController(userDatabase)), new BaseUniversityController(universityDatabase));

const commentController = new CommentController(commentDatabase, new BaseEventController(eventDatabase));

eventRoute.use(new JWTAuthenticator(userDatabase).authenticate(new TokenCreator<IIdentification>(privateKey)));

eventRoute.use(express.json({ limit: '30mb' }));

eventRoute.route('/')
    .get(eventController.getAll)
    .post(eventController.create);

eventRoute.route('/:eventID')
    .get(eventController.get)
    .delete(eventController.delete);

eventRoute.route('/:eventID/comments')
    .get(commentController.getAll)
    .post(commentController.create);

eventRoute.route('/:eventID/comments/:commentID')
    .get(commentController.get)
    .post(commentController.update)
    .delete(commentController.delete);