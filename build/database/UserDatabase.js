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
const UniversityMemberType_1 = require("../serverAPI/model/internal/universityMember/UniversityMemberType");
/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 *
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
class UserDatabase {
    static instance;
    mysqlPool;
    constructor(mysqlHost, databaseName, username, password) {
        let mysqlConnection = mysql_1.default.createPool({
            host: mysqlHost,
            database: databaseName,
            user: username,
            password: password
        });
        this.mysqlPool = mysqlConnection;
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
    parseUser(result) {
        return {
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            lastSeen: result.lastSeen,
            username: result.username,
            password: result.password,
            userID: result.userID,
            userLevel: result.userLevel,
            universityAffiliation: this.parseUniversity(result.universityAffiliation),
            organizationsAffiliation: this.parseOrganizations(result.organizationsAffiliation)
        };
    }
    parseOrganizations(result) {
        return [];
    }
    parseUniversity(result) {
        return {
            affiliationType: {
                memberType: UniversityMemberType_1.UniversityMemberType.STUDENT,
                organizationID: new bson_1.ObjectId(),
                userID: new bson_1.ObjectId()
            }, organization: { description: "", location: { address: "", latitude: 0, longitude: 0 }, name: "", numStudents: 0, universityID: new bson_1.ObjectId() }
        };
    }
    async GetAll(parameters) {
        await this.mysqlPool.query(`SELECT * FROM User`, (error, results, fields) => {
            if (error || !Array.isArray(results) || results.length === 0) {
                return Promise.resolve(null);
            }
            let users = [];
            results.forEach((element) => users.push(this.parseUser(element)));
            return Promise.resolve(users);
        });
        return Promise.resolve(null);
    }
    getSearchQuery(parameters) {
        let query = "";
        parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
        query = query.substring(0, query.length - 5);
        return query;
    }
    async Get(parameters) {
        let query = this.getSearchQuery(parameters);
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }
                connection.query(`SELECT * FROM User WHERE ${query} LIMIT 1;`, (error, results, fields) => {
                    connection.release();
                    if (error || !Array.isArray(results) || results.length === 0) {
                        return resolve(null);
                    }
                    return resolve(this.parseUser(results[0]));
                });
            });
        });
    }
    async Create(object) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }
                connection.query(`INSERT INTO User (userID, firstName, lastName, lastSeen, userLevel, username, password, email) 
                VALUES('${object.userID.toString()}', '${object.firstName}', '${object.lastName}', ${object.lastSeen}, ${object.userLevel}, '${object.username}', '${object.password}', '${object.email}');`, async (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    return resolve(this.Get(new Map([['userID', object.userID.toString()]])));
                });
            });
        });
    }
    Update(id, object) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }
                connection.query(`UPDATE User SET firstName = '${object.firstName}', lastName = '${object.lastName}', lastSeen = ${object.lastSeen}, userLevel = ${object.userLevel}, username = '${object.username}', password = '${object.password}', email = '${object.email}' WHERE userID = '${id}';`, async (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    return resolve(this.Get(new Map([['userID', id]])));
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
                connection.query(`DELETE FROM User WHERE userID = '${id}';`, async (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(error);
                    }
                    return results.affectedRows === 0 ? resolve(false) : resolve(true);
                });
            });
        });
    }
}
exports.default = UserDatabase;
//# sourceMappingURL=UserDatabase.js.map