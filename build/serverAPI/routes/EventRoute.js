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
exports.eventRoute = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controller/UserController"));
const JWTAuthenticator_1 = __importDefault(require("../middleware/authentication/JWTAuthenticator"));
const TokenCreator_1 = __importDefault(require("../../utils/TokenCreator"));
const UserDatabase_1 = __importDefault(require("../../database/UserDatabase"));
const EventController_1 = __importDefault(require("../controller/EventController"));
const EventDatabase_1 = __importDefault(require("../../database/EventDatabase"));
const CommentController_1 = __importDefault(require("../controller/CommentController"));
exports.eventRoute = express_1.default.Router();
let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let username = process.env.DB_USERNAME;
let password = process.env.DB_PASSWORD;
let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;
const userDatabase = UserDatabase_1.default.connect(databaseURL, databaseName, username, password);
const eventDatabase = EventDatabase_1.default.connect(databaseURL, databaseName, username, password);
const eventController = new EventController_1.default(eventDatabase, new UserController_1.default(userDatabase));
const commentController = new CommentController_1.default(eventController);
exports.eventRoute.use(new JWTAuthenticator_1.default(userDatabase).authenticate(new TokenCreator_1.default(privateKey)));
exports.eventRoute.use(express_1.default.json({ limit: '30mb' }));
exports.eventRoute.route('/events')
    .get(eventController.getAll)
    .post(eventController.add);
exports.eventRoute.route('events/:eventID')
    .get(eventController.get)
    .delete(eventController.delete);
exports.eventRoute.route('/comments')
    .get(commentController.getAll)
    .post(commentController.add);
exports.eventRoute.route('/comments/:commentID')
    .get(commentController.get)
    .delete(commentController.delete);
//# sourceMappingURL=EventRoute.js.map