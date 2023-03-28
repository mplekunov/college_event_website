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
class UserDatabase {
    static instance;
    static universityDatabase;
    mysqlPool;
    constructor(mysqlHost, databaseName, username, password, universityDatabase) {
        let mysqlConnection = mysql_1.default.createPool({
            host: mysqlHost,
            database: databaseName,
            user: username,
            password: password
        });
        UserDatabase.universityDatabase = universityDatabase;
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
    static connect(mysqlHost, databaseName, username, password, universityDatabase) {
        if (UserDatabase.instance === undefined) {
            UserDatabase.instance = new UserDatabase(mysqlHost, databaseName, username, password, universityDatabase);
        }
        return UserDatabase.instance;
    }
    async parseUser(result) {
        let universityAffiliation;
        let organizationsAffiliation;
        try {
            universityAffiliation = await this.parseUniversity(result);
            organizationsAffiliation = await this.parseOrganizations(result);
        }
        catch (error) {
            return Promise.reject(`User creation: ${error}`);
        }
        return {
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            lastSeen: result.lastSeen,
            username: result.username,
            password: result.password,
            userID: result.userID,
            userLevel: result.userLevel,
            universityAffiliation: universityAffiliation,
            organizationsAffiliation: organizationsAffiliation
        };
    }
    async parseOrganizations(result) {
        let memberInfo;
        try {
            memberInfo = await new Promise((resolve, reject) => this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`User creation: ${err}`);
                }
                connection.query(`SELECT * FROM RSO_Members WHERE userID = '${result.userID}';`, (error, results, fields) => {
                    connection.release();
                    if (error || !Array.isArray(results) || results.length === 0) {
                        return resolve([]);
                    }
                    return resolve(results);
                });
            }));
        }
        catch (error) {
            return Promise.reject(error);
        }
        let organizations = [];
        memberInfo.forEach(async (element) => {
            organizations.push({
                affiliationType: parseInt(element.memberType),
                organizationName: element.rsoName
            });
        });
        return organizations;
    }
    async getUniversityMemberInfo(userID) {
        return new Promise((resolve, reject) => this.mysqlPool.getConnection((err, connection) => {
            if (err) {
                return reject(`User creation: ${err}`);
            }
            connection.query(`SELECT * FROM University_Members WHERE userID = '${userID}';`, (error, results, fields) => {
                connection.release();
                if (error || !Array.isArray(results) || results.length === 0) {
                    return reject("User creation: Could not find university member info.");
                }
                return resolve(results[0]);
            });
        }));
    }
    async createUniveristyMemberInfo(userID, universityID, universityName, memberType) {
        return new Promise((resolve, reject) => this.mysqlPool.getConnection((err, connection) => {
            if (err) {
                return reject(`User creation: ${err}`);
            }
            connection.query(`INSERT INTO University_Members (userID, memberType, universityName, universityID) 
                VALUES('${userID}', ${memberType}, '${universityName}', '${universityID}');`, (error, results, fields) => {
                connection.release();
                if (error) {
                    return reject("User creation: Could not create university member info.");
                }
                return resolve(this.getUniversityMemberInfo(userID));
            });
        }));
    }
    async parseUniversity(result) {
        let memberInfo;
        try {
            memberInfo = await this.getUniversityMemberInfo(result.userID);
        }
        catch (error) {
            return Promise.reject(`User creation: ${error}`);
        }
        return {
            organizationName: memberInfo.universityName,
            affiliationType: parseInt(memberInfo.memberType)
        };
    }
    async GetAll(parameters) {
        await this.mysqlPool.query(`SELECT * FROM User`, (error, results, fields) => {
            if (error || !Array.isArray(results) || results.length === 0) {
                return Promise.resolve(null);
            }
            let users = [];
            results.forEach(async (element) => users.push(await this.parseUser(element)));
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
                    return reject(`User creation: ${err}`);
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
            this.mysqlPool.getConnection(async (err, connection) => {
                if (err) {
                    return reject(`User creation: ${err}`);
                }
                let university;
                try {
                    university = await UserDatabase.universityDatabase.Get(new Map([['name', object.universityAffiliation.organizationName]]));
                }
                catch (response) {
                    return reject(`User creation: ${response}`);
                }
                let userID = (new bson_1.ObjectId()).toString();
                connection.query(`INSERT INTO User (userID, firstName, lastName, lastSeen, userLevel, username, password, email) 
                VALUES('${userID}', '${object.firstName}', '${object.lastName}', ${object.lastSeen}, ${object.userLevel}, '${object.username}', '${object.password}', '${object.email}');`, async (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(`User creation: ${error}`);
                    }
                    try {
                        if (university === null) {
                            return reject('User creation: University could not be found.');
                        }
                        await this.createUniveristyMemberInfo(userID, university.universityID.toString(), university.name, object.universityAffiliation.affiliationType);
                        let user = await this.Get(new Map([['username', object.username]]));
                        if (user === null) {
                            return reject('User creation: User could not be found.');
                        }
                        return resolve(user);
                    }
                    catch (error) {
                        return reject(`User creation: ${error}`);
                    }
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
                        return reject(`User creation: ${error}`);
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
                    return reject(`User creation: ${err}`);
                }
                connection.query(`DELETE FROM User WHERE userID = '${id}';`, async (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(`User creation: ${error}`);
                    }
                    return results.affectedRows === 0 ? resolve(false) : resolve(true);
                });
            });
        });
    }
}
exports.default = UserDatabase;
//# sourceMappingURL=UserDatabase.js.map