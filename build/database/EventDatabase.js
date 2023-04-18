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
const path_1 = require("path");
const bson_1 = require("bson");
const HostType_1 = require("../serverAPI/model/internal/host/HostType");
/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 *
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
class EventDatabase {
    static instance;
    static locationDatabase;
    mysqlPool;
    constructor(mysqlHost, databaseName, username, password, locationDatabase) {
        let mysqlConnection = mysql_1.default.createPool({
            host: mysqlHost,
            database: databaseName,
            user: username,
            password: password
        });
        EventDatabase.locationDatabase = locationDatabase;
        this.mysqlPool = mysqlConnection;
    }
    /**
     * Retrieves current instance of the UserDatabase if such exists.
     *
     * @returns UserDatabase object or undefined.
     */
    static getInstance() {
        return EventDatabase.instance;
    }
    /**
     * Connects to the database if database instance doesn't exist.
     *
     * @returns UserDatabase object.
     */
    static connect(mysqlHost, databaseName, username, password, locationDatabase) {
        if (EventDatabase.instance === undefined) {
            EventDatabase.instance = new EventDatabase(mysqlHost, databaseName, username, password, locationDatabase);
        }
        return EventDatabase.instance;
    }
    getSearchQuery(parameters, dilimiter) {
        let query = "";
        parameters.forEach((value, key) => query += `${key} = '${value}' ${path_1.delimiter} `);
        query = query.substring(0, query.length - (path_1.delimiter.length + 1));
        return query;
    }
    async parseEvent(result) {
        let location;
        try {
            location = await EventDatabase.locationDatabase.Get(new Map([["locationID", result.locationID]]));
        }
        catch (err) {
            return Promise.reject(err);
        }
        if (location === null) {
            return Promise.reject("Location not found.");
        }
        return Promise.resolve({
            eventID: new bson_1.ObjectId(result.eventID),
            name: result.name,
            description: result.description,
            location: location,
            category: result.category,
            date: result.date,
            email: result.email,
            phone: result.phone,
            hostID: new bson_1.ObjectId(result.hostID),
            hostType: parseInt(result.hostType)
        });
    }
    GetAll(parameters) {
        let query = "";
        if (parameters?.get("hostType") === HostType_1.HostType.PUBLIC) {
            query = `hostType = ${HostType_1.HostType.PUBLIC}`;
        }
        else if (parameters?.get("hostType") === HostType_1.HostType.UNIVERSITY) {
            query = `hostType = ${HostType_1.HostType.UNIVERSITY}`;
        }
        else if (parameters?.get("hostType") === HostType_1.HostType.RSO) {
            Array(parameters.get("hostID")).forEach(hostID => {
                query += `hostID = '${hostID}' OR `;
            });
            query = query.substring(0, query.length - 4);
        }
        return new Promise((resolve, rejects) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return rejects(err);
                }
                connection.query(`SELECT * FROM Event WHERE ${query}`, (err, results) => {
                    connection.release();
                    if (err || !Array.isArray(results) || results.length === 0) {
                        return resolve([]);
                    }
                    let events = [];
                    results.forEach((result) => {
                        events.push(this.parseEvent(result));
                    });
                    return resolve(events);
                });
            });
        });
    }
    Get(parameters) {
        let query = parameters.has("eventID") ? `eventID='${parameters.get("eventID")}'` : "";
        return new Promise((resolve, rejects) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return rejects(err);
                }
                connection.query(`SELECT * FROM Event WHERE ${query} LIMIT 1;`, (err, results) => {
                    connection.release();
                    if (err) {
                        return rejects(err);
                    }
                    return resolve(this.parseEvent(results[0]));
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
                let location = await EventDatabase.locationDatabase.Get(new Map([["address", object.location.address]]));
                if (location === null) {
                    location = await EventDatabase.locationDatabase.Create(object.location);
                    if (location === null) {
                        return reject("Failed to create location");
                    }
                }
                let eventID = new bson_1.ObjectId();
                connection.query(`INSERT INTO Event (eventID, name, description, locationID, category, date, email, phone, hostID, hostType) 
                VALUES ('${eventID.toString()}', '${object.name}', '${object.description}', '${location.locationID.toString()}', '${object.category}', '${object.date}', '${object.email}', '${object.phone}', '${object.hostID.toString()}', '${object.hostType}');`, (err, results) => {
                    connection.release();
                    if (err) {
                        return reject(err);
                    }
                    return resolve(this.Get(new Map([["eventID", eventID]])));
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
                let location = await EventDatabase.locationDatabase.Get(new Map([["address", object.location.address]]));
                if (location === null) {
                    location = await EventDatabase.locationDatabase.Create(object.location);
                    if (location === null) {
                        return reject("Failed to create location");
                    }
                }
                connection.query(`UPDATE Event SET name = '${object.name}', description = '${object.description}', locationID = '${location.locationID.toString()}', category = '${object.category}', date = '${object.date}', email = '${object.email}', phone = '${object.phone}', hostID = '${object.hostID.toString()}', hostType = '${object.hostType}' WHERE eventID = '${id}';`, (err, results) => {
                    connection.release();
                    if (err) {
                        return reject(err);
                    }
                    return resolve(this.Get(new Map([["eventID", id]])));
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
                connection.query(`DELETE FROM Event WHERE eventID = '${id}';`, (err, results) => {
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
exports.default = EventDatabase;
//# sourceMappingURL=EventDatabase.js.map