"use strict";
/**
 * This file is responsible for construction of the routes for UserController.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controller/UserController"));
const JWTAuthenticator_1 = __importDefault(require("../middleware/authentication/JWTAuthenticator"));
const TokenCreator_1 = __importDefault(require("../../utils/TokenCreator"));
const UserDatabase_1 = __importDefault(require("../../database/UserDatabase"));
exports.userRoute = express_1.default.Router();
let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;
let freeImageHostApiKey = process.env.FREE_IMAGE_HOST_API_KEY;
let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;
const database = UserDatabase_1.default.connect(databaseURL, databaseName, collectionName);
const userController = new UserController_1.default(database);
exports.userRoute.use(new JWTAuthenticator_1.default().authenticate(new TokenCreator_1.default(privateKey)));
exports.userRoute.use(express_1.default.json({ limit: '30mb' }));
exports.userRoute.route('/')
    .get(userController.get)
    .delete(userController.delete);
//# sourceMappingURL=UserRoutes.js.map