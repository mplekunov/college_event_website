"use strict";
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
exports.server = exports.app = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// process.env.DB_CONNECTION_STRING = process.env.NODE_ENV === "dev" ?
if (process.env.NODE_ENV.length <= 0) {
    console.log(`Server cannot be run without NODE_ENV variable set.`);
    (0, process_1.exit)(1);
}
console.log(`Server is in ${process.env.NODE_ENV} mode.`);
const express_1 = __importDefault(require("express"));
const process_1 = require("process");
const Logger_1 = __importDefault(require("./serverAPI/middleware/logger/Logger"));
const UserRoutes_1 = require("./serverAPI/routes/UserRoutes");
const AuthenticationRoutes_1 = require("./serverAPI/routes/AuthenticationRoutes");
const RSORoutes_1 = require("./serverAPI/routes/RSORoutes");
const EventRoute_1 = require("./serverAPI/routes/EventRoute");
const UniversityRoutes_1 = require("./serverAPI/routes/UniversityRoutes");
const app = (0, express_1.default)();
exports.app = app;
app.use(Logger_1.default.consoleLog);
const cors = require("cors");
var corsOptions = {
    origin: true
};
app.use(cors(corsOptions));
app.use('/users', UserRoutes_1.userRoute);
app.use('/universities', UniversityRoutes_1.universityRoute);
app.use('/auth', AuthenticationRoutes_1.authenticationRoute);
app.use('/rsos', RSORoutes_1.rsoRoute);
app.use('/events', EventRoute_1.eventRoute);
const server = (port) => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
};
exports.server = server;
//# sourceMappingURL=Main.js.map