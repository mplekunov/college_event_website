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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const mysql_1 = __importDefault(require("mysql"));
/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 *
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
class UserDatabase {
    static instance;
    mysqlConnection;
    constructor(mysqlHost, databaseName, username, password) {
        let mysqlConnection = mysql_1.default.createConnection({
            host: mysqlHost,
            database: databaseName,
            user: username,
            password: password
        });
        mysqlConnection.connect();
        this.mysqlConnection = mysqlConnection;
    }
    /**
     * Retrieves current instance of the UserDatabase if such exists.
     *
     * @returns UserDatabase object or undefined.
     */
    static getInstance() {
        return UserDatabase.instance;
    }
    /**
     * Connects to the database if database instance doesn't exist.
     *
     * @returns UserDatabase object.
     */
    static connect(mysqlHost, databaseName, username, password) {
        if (UserDatabase.instance === undefined) {
            UserDatabase.instance = new UserDatabase(mysqlHost, databaseName, username, password);
        }
        return UserDatabase.instance;
    }
    GetAll(parameters) {
        throw new Error('Method not implemented.');
    }
    Get(parameters) {
        throw new Error('Method not implemented.');
    }
    Create(object) {
        throw new Error('Method not implemented.');
    }
    Update(id, object) {
        throw new Error('Method not implemented.');
    }
    Delete(id) {
        throw new Error('Method not implemented.');
    }
}
exports.default = UserDatabase;
//# sourceMappingURL=UserDatabase.js.map