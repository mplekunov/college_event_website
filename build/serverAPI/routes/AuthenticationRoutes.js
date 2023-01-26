"use strict";
/**
 * This file is responsible for construction of the routes for AuthenticationController.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationRoute = void 0;
const express_1 = __importDefault(require("express"));
const AuthenticationController_1 = __importDefault(require("../controller/AuthenticationController"));
const UserDatabase_1 = __importDefault(require("../../database/UserDatabase"));
const Encryptor_1 = __importDefault(require("../../utils/Encryptor"));
const TokenCreator_1 = __importDefault(require("../../utils/TokenCreator"));
const JWTAuthenticator_1 = __importDefault(require("../middleware/authentication/JWTAuthenticator"));
exports.authenticationRoute = express_1.default.Router();
let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;
let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;
const authenticationController = new AuthenticationController_1.default(UserDatabase_1.default.connect(databaseURL, databaseName, collectionName), new Encryptor_1.default(), new TokenCreator_1.default(privateKey));
const authenticator = new JWTAuthenticator_1.default().authenticate(new TokenCreator_1.default(privateKey));
exports.authenticationRoute.use(express_1.default.json({ limit: '30mb' }));
exports.authenticationRoute.post("/login", authenticationController.login);
exports.authenticationRoute.post("/register", authenticationController.register);
exports.authenticationRoute.get("/logout", authenticator, authenticationController.logout);
exports.authenticationRoute.post("/refreshJWT", authenticationController.refreshJWT);
//# sourceMappingURL=AuthenticationRoutes.js.map