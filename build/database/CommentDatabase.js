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
const bson_1 = require("bson");
/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 *
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
class CommentDatabase {
    static instance;
    static EventDatabase;
    static UserDatabase;
    mysqlPool;
    constructor(mysqlHost, databaseName, username, password, EventDatabase, UserDatabase) {
        let mysqlConnection = mysql_1.default.createPool({
            host: mysqlHost,
            database: databaseName,
            user: username,
            password: password
        });
        CommentDatabase.EventDatabase = EventDatabase;
        CommentDatabase.UserDatabase = UserDatabase;
        this.mysqlPool = mysqlConnection;
    }
    /**
     * Retrieves current instance of the UserDatabase if such exists.
     *
     * @returns UserDatabase object or undefined.
     */
    static getInstance() {
        return CommentDatabase.instance;
    }
    /**
     * Connects to the database if database instance doesn't exist.
     *
     * @returns UserDatabase object.
     */
    static connect(mysqlHost, databaseName, username, password, eventDatabase, userDatabase) {
        if (CommentDatabase.instance === undefined) {
            CommentDatabase.instance = new CommentDatabase(mysqlHost, databaseName, username, password, eventDatabase, userDatabase);
        }
        return CommentDatabase.instance;
    }
    getSearchQuery(parameters) {
        let query = "";
        parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
        query = query.substring(0, query.length - 5);
        return query;
    }
    async parseComment(result) {
        let username = (await CommentDatabase.UserDatabase.Get(new Map([["userID", result.userID]])))?.username;
        return Promise.resolve({
            eventID: new bson_1.ObjectId(result.eventID),
            userID: new bson_1.ObjectId(result.userID),
            commentID: new bson_1.ObjectId(result.commentID),
            username: username ? username : "",
            content: result.content
        });
    }
    GetAll(parameters) {
        let query = parameters ? this.getSearchQuery(parameters) : "";
        return new Promise((resolve, rejects) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return rejects(err);
                }
                connection.query(`SELECT * FROM Comment WHERE ${query}`, (err, results) => {
                    connection.release();
                    if (err || !Array.isArray(results) || results.length === 0) {
                        return resolve([]);
                    }
                    let events = [];
                    results.forEach((result) => {
                        events.push(this.parseComment(result));
                    });
                    return resolve(events);
                });
            });
        });
    }
    Get(parameters) {
        let query = parameters ? this.getSearchQuery(parameters) : "";
        return new Promise((resolve, rejects) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return rejects(err);
                }
                connection.query(`SELECT * FROM Comment WHERE ${query} LIMIT 1;`, (err, results) => {
                    connection.release();
                    if (err || !Array.isArray(results) || results.length === 0) {
                        return rejects(err);
                    }
                    return resolve(this.parseComment(results[0]));
                });
            });
        });
    }
    Create(object) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection(async (err, connection) => {
                if (err) {
                    return reject(err);
                }
                let event = await CommentDatabase.EventDatabase.Get(new Map([["eventID", object.eventID]]));
                let user = await CommentDatabase.UserDatabase.Get(new Map([["userID", object.userID]]));
                if (!event || !user) {
                    return reject("Event or user doesn't exist");
                }
                let commentID = new bson_1.ObjectId();
                connection.query(`INSERT INTO Comment (commentID, eventID, userID, content) 
                VALUES ('${commentID.toString()}', '${object.eventID.toString()}', '${object.userID.toString()}', '${object.content}');`, (err, results) => {
                    connection.release();
                    if (err) {
                        return reject(err);
                    }
                    return resolve(this.Get(new Map([["commentID", commentID]])));
                });
            });
        });
    }
    Update(id, object) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection(async (err, connection) => {
                if (err) {
                    return reject(err);
                }
                connection.query(`UPDATE Comment SET content = '${object.content}' WHERE commentID = '${id}';`, (err, results) => {
                    connection.release();
                    if (err) {
                        return reject(err);
                    }
                    return resolve(this.Get(new Map([["commentID", id]])));
                });
            });
        });
    }
    Delete(id) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }
                connection.query(`DELETE FROM Comment WHERE commentID = '${id}';`, (err, results) => {
                    connection.release();
                    if (err) {
                        return reject(err);
                    }
                    return resolve(true);
                });
            });
        });
    }
}
exports.default = CommentDatabase;
//# sourceMappingURL=CommentDatabase.js.map