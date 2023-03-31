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
class RSODatabase {
    static instance;
    mysqlPool;
    constructor(mysqlHost, databaseName, username, password) {
        let mysqlPool = mysql_1.default.createPool({
            host: mysqlHost,
            database: databaseName,
            user: username,
            password: password
        });
        this.mysqlPool = mysqlPool;
    }
    /**
     * Retrieves current instance of the UserDatabase if such exists.
     *
     * @returns UserDatabase object or undefined.
     */
    static getInstance() {
        return this.instance;
    }
    /**
     * Connects to the database if database instance doesn't exist.
     *
     * @returns UserDatabase object.
     */
    static connect(mysqlHost, databaseName, username, password) {
        if (this.instance === undefined) {
            this.instance = new RSODatabase(mysqlHost, databaseName, username, password);
        }
        return this.instance;
    }
    getSearchQuery(parameters) {
        let query = "";
        parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
        query = query.substring(0, query.length - 5);
        return query;
    }
    getUserRSO(userID) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }
                connection.query(`SELECT * FROM RSO_Members WHERE userID = '${userID.toString()}';`, (error, results, fields) => {
                    connection.release();
                    if (error || !Array.isArray(results)) {
                        return reject(`RSODatabase: ${error}`);
                    }
                    let rsos = [];
                    results.forEach(async (member) => {
                        rsos.push(this.Get(new Map([["rsoID", member.rsoID]])));
                    });
                    return resolve(rsos);
                });
            });
        });
    }
    getMembers(rsoID) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }
                connection.query(`SELECT * FROM RSO_Members WHERE rsoID = '${rsoID.toString()}';`, (error, results, fields) => {
                    connection.release();
                    if (error || !Array.isArray(results)) {
                        console.log(error);
                        return reject(`RSODatabase: ${error}`);
                    }
                    let members = [];
                    results.forEach((member) => {
                        members.push({
                            userID: new bson_1.ObjectId(member.userID),
                            memberType: member.memberType,
                        });
                    });
                    return resolve(members);
                });
            });
        });
    }
    addMember(rsoID, userID, memberType, rsoName) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }
                connection.query(`INSERT INTO RSO_Members (rsoID, userID, memberType, rsoName)
                VALUES ('${rsoID.toString()}', '${userID.toString()}', ${memberType}, '${rsoName}');`, (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(`RSODatabase: ${error}`);
                    }
                    return resolve(this.Get(new Map([['rsoID', rsoID]])));
                });
            });
        });
    }
    deleteMember(rsoID, userID) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }
                connection.query(`DELETE FROM RSO_Members WHERE rsoID = '${rsoID.toString()}' AND userID = '${userID.toString()}';`, (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(`RSODatabase: ${error}`);
                    }
                    return resolve(this.Get(new Map([['rsoID', rsoID]])));
                });
            });
        });
    }
    async parseRSO(result) {
        let rsoID = new bson_1.ObjectId(result.rsoID);
        return {
            rsoID: new bson_1.ObjectId(rsoID),
            name: result.name,
            description: result.description,
            members: await this.getMembers(rsoID)
        };
    }
    GetAll(parameters) {
        if (parameters?.has('userID')) {
            return Promise.resolve(this.getUserRSO(new bson_1.ObjectId(parameters.get('userID'))));
        }
        throw new Error('Method not implemented.');
    }
    Get(parameters) {
        let query = this.getSearchQuery(parameters);
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }
                connection.query(`SELECT * FROM RSO WHERE ${query} LIMIT 1;`, async (error, results, fields) => {
                    connection.release();
                    if (error || !Array.isArray(results) || results.length === 0) {
                        return resolve(null);
                    }
                    return resolve(this.parseRSO(results[0]));
                });
            });
        });
    }
    Create(object) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection(async (err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }
                let rsoID = new bson_1.ObjectId();
                if (await this.Get(new Map([["name", object.name]])) !== null) {
                    return reject(`RSODatabase: RSO with such name already exists`);
                }
                connection.query(`INSERT INTO RSO (rsoID, name, description) 
                VALUES ('${rsoID.toString()}', '${object.name}', '${object.description}');`, async (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(`RSODatabase: ${error}`);
                    }
                    try {
                        let members = new Set((await this.getMembers(rsoID)).flatMap((member) => member.userID.toString()));
                        for (const member of object.members) {
                            if (!members.has(member.userID.toString())) {
                                await this.addMember(rsoID, member.userID, member.memberType, object.name);
                            }
                        }
                    }
                    catch (error) {
                        return reject(`RSODatabase: ${error}`);
                    }
                    return resolve(this.Get(new Map([['rsoID', rsoID.toString()]])));
                });
            });
        });
    }
    Update(id, object) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }
                connection.query(`UPDATE RSO SET name = '${object.name}', description = '${object.description}' WHERE rsoID = '${id}';`, async (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(`RSODatabase: ${error}`);
                    }
                    try {
                        let members = await this.getMembers(new bson_1.ObjectId(id));
                        for (const member of members) {
                            await this.deleteMember(new bson_1.ObjectId(id), member.userID);
                        }
                        for (const member of object.members) {
                            await this.addMember(new bson_1.ObjectId(id), member.userID, member.memberType, object.name);
                        }
                    }
                    catch (error) {
                        return reject(`RSODatabase: ${error}`);
                    }
                    return resolve(this.Get(new Map([['rsoID', id]])));
                });
            });
        });
    }
    Delete(id) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }
                connection.query(`DELETE FROM RSO WHERE rsoID = '${id}';`, (error, results, fields) => {
                    connection.release();
                    if (error) {
                        return reject(`RSODatabase: ${error}`);
                    }
                    return resolve(true);
                });
            });
        });
    }
}
exports.default = RSODatabase;
//# sourceMappingURL=RSODatabase.js.map