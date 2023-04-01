import * as dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql';

import IUser from '../serverAPI/model/internal/user/IUser';
import IDatabase from './IDatabase';
import IBaseEvent from '../serverAPI/model/internal/event/IBaseEvent';
import IEvent from '../serverAPI/model/internal/event/IEvent';
import { resolve } from 'path';
import { rejects } from 'assert';
import LocationDatabase from './LocationDatabase';
import { ObjectId } from 'bson';
import { HostType } from '../serverAPI/model/internal/host/HostType';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class EventDatabase implements IDatabase<IBaseEvent, IEvent> {
    private static instance?: EventDatabase;
    private static locationDatabase: LocationDatabase;

    private mysqlPool: mysql.Pool;

    private constructor(
        mysqlHost: string,
        databaseName: string,
        username: string,
        password: string,
        locationDatabase: LocationDatabase
    ) {
        let mysqlConnection = mysql.createPool({
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
    static getInstance(): EventDatabase | undefined {
        return EventDatabase.instance;
    }

    /**
     * Connects to the database if database instance doesn't exist.
     * 
     * @returns UserDatabase object.
     */
    static connect(
        mysqlHost: string,
        databaseName: string,
        username: string,
        password: string,
        locationDatabase: LocationDatabase
    ): EventDatabase {
        if (EventDatabase.instance === undefined) {
            EventDatabase.instance = new EventDatabase(mysqlHost, databaseName, username, password, locationDatabase);
        }

        return EventDatabase.instance;
    }

    private getSearchQuery(parameters: Map<String, any>): string {
        let query = "";

        parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
        query = query.substring(0, query.length - 5);

        return query;
    }

    private async parseEvent(result: any): Promise<IEvent> {
        let location;

        try {
            location = await EventDatabase.locationDatabase.Get(new Map([["locationID", result.locationID]]));
        } catch (err) {
            return Promise.reject(err);
        }

        if (location === null) {
            return Promise.reject("Location not found.");
        }

        return Promise.resolve({
            eventID: new ObjectId(result.eventID),
            name: result.name,
            description: result.description,
            location: location,
            category: result.category,
            date: result.date,
            email: result.email,
            phone: result.phone,
            hostID: new ObjectId(result.hostID),
            hostType: parseInt(result.hostType) as HostType
        });
    }

    GetAll(parameters?: Map<String, any> | undefined): Promise<Promise<IEvent | null>[] | null> {
        let query = parameters ? this.getSearchQuery(parameters) : "";

        return new Promise((resolve, rejects) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return rejects(err);
                }

                connection.query(`SELECT * FROM Event WHERE ${query}`, (err, results) => {
                    connection.release();

                    if (err || !Array.isArray(results) || results.length === 0) {
                        return rejects(err);
                    }

                    let events: Promise<IEvent | null>[] = [];

                    results.forEach((result: any) => {
                        events.push(this.parseEvent(result));
                    });

                    return resolve(events);
                });
            });
        });
    }

    Get(parameters: Map<String, any>): Promise<IEvent | null> {
        let query = parameters ? this.getSearchQuery(parameters) : "";

        return new Promise((resolve, rejects) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return rejects(err);
                }

                connection.query(`SELECT * FROM Event WHERE ${query} LIMIT 1;`, (err, results) => {
                    connection.release();

                    if (err || !Array.isArray(results) || results.length === 0) {
                        return rejects(err);
                    }

                    return resolve(this.parseEvent(results[0]));
                });
            });
        });
    }

    Create(object: IBaseEvent): Promise<IEvent | null> {
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

                let eventID = new ObjectId();

                connection.query(`INSERT INTO Event (eventID, name, description, locationID, category, date, email, phone, hostID, hostType) 
                VALUES ('${eventID.toString()}', '${object.name}', '${object.description}', '${location.locationID.toString()}', '${object.category}', '${object.date}', '${object.email}', '${object.phone}', '${object.hostID.toString()}', '${object.hostType}');`,
                    (err, results) => {
                        connection.release();

                        if (err) {
                            return reject(err);
                        }

                        return resolve(this.Get(new Map([["eventID", eventID]])));
                    });
            });
        });
    }

    Update(id: string, object: IBaseEvent): Promise<IEvent | null> {
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

                connection.query(`UPDATE Event SET name = '${object.name}', description = '${object.description}', locationID = '${location.locationID.toString()}', category = '${object.category}', date = '${object.date}', email = '${object.email}', phone = '${object.phone}', hostID = '${object.hostID.toString()}', hostType = '${object.hostType}' WHERE eventID = '${id}';`,
                    (err, results) => {
                        connection.release();

                        if (err) {
                            return reject(err);
                        }

                        return resolve(this.Get(new Map([["eventID", id]])));

                    });
            });
        });
    }

    Delete(id: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }

                connection.query(`DELETE FROM Event WHERE eventID = '${id}';`,
                    (err, results) => {
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
