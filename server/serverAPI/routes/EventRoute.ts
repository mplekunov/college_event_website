// /**
//  * This file is responsible for construction of the routes for UserController.
//  */

// import * as dotenv from 'dotenv';
// dotenv.config();

// import express from 'express';

// import UserController from '../controller/UserController';

// import JWTAuthenticator from '../middleware/authentication/JWTAuthenticator';

// import TokenCreator from '../../utils/TokenCreator';

// import IIdentification from '../model/internal/user/IIdentification';

// import UserDatabase from '../../database/UserDatabase';
// import EventController from '../controller/EventController';
// import EventDatabase from '../../database/EventDatabase';
// import CommentController from '../controller/CommentController';
// import UniversityDatabase from '../../database/UniversityDatabase';
// import LocationDatabase from '../../database/LocationDatabase';

// export const eventRoute = express.Router();

// let databaseURL = process.env.DB_CONNECTION_STRING;
// let databaseName = process.env.DB_NAME;
// let username = process.env.DB_USERNAME;
// let password = process.env.DB_PASSWORD;

// let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

// const userDatabase = UserDatabase.connect(
//     databaseURL,
//     databaseName,
//     username,
//     password,
//     UniversityDatabase.connect(
//         databaseURL,
//         databaseName,
//         username,
//         password,
//         LocationDatabase.connect(
//             databaseURL,
//             databaseName,
//             username,
//             password
//         )
//     )
// );

// const eventDatabase = EventDatabase.connect(
//     databaseURL,
//     databaseName,
//     username,
//     password
// );

// const eventController = new EventController(eventDatabase, new UserController(userDatabase));

// const commentController = new CommentController(eventController);

// eventRoute.use(new JWTAuthenticator(userDatabase).authenticate(new TokenCreator<IIdentification>(privateKey)));

// eventRoute.use(express.json({ limit: '30mb' }));

// eventRoute.route('/events')
//     .get(eventController.getAll)
//     .post(eventController.add);

// eventRoute.route('events/:eventID')
//     .get(eventController.get)
//     .delete(eventController.delete);

// eventRoute.route('/comments')
//     .get(commentController.getAll)
//     .post(commentController.add);

// eventRoute.route('/comments/:commentID')
//     .get(commentController.get)
//     .delete(commentController.delete);