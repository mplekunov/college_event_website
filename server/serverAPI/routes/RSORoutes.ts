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
// // import RSOController from '../controller/RSOController';
// import RSODatabase from '../../database/RSODatabase';
// import UniversityDatabase from '../../database/UniversityDatabase';
// import LocationDatabase from '../../database/LocationDatabase';

// export const rsoRoute = express.Router();

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

// const rsoDatabase = RSODatabase.connect(
//     databaseURL,
//     databaseName,
//     username,
//     password
// );

// const rsoController = new RSOController(rsoDatabase, new UserController(userDatabase));

// rsoRoute.use(new JWTAuthenticator(userDatabase).authenticate(new TokenCreator<IIdentification>(privateKey)));

// rsoRoute.use(express.json({ limit: '30mb' }));

// rsoRoute.route('/rsos')
//     .get(rsoController.getAll)
//     .post(rsoController.add);

// rsoRoute.route('/rsos/:rsoID')
//     .get(rsoController.get)
//     .delete(rsoController.delete);
    

// rsoRoute.route('/rsos/:rsoID/enter')
//     .get(rsoController.enter);

// rsoRoute.route('/rsos/:rsoID/leave')
//     .get(rsoController.leave);
