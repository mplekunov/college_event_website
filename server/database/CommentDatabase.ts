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
import IBaseComment from '../serverAPI/model/internal/comment/IBaseComment';
import IComment from '../serverAPI/model/internal/comment/IComment';
import EventDatabase from './EventDatabase';
import UserDatabase from './UserDatabase';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class CommentDatabase implements IDatabase<IBaseComment, IComment> {
    private static instance?: CommentDatabase;
    private static EventDatabase: EventDatabase;
    private static UserDatabase: UserDatabase;

    private mysqlPool: mysql.Pool;

    private constructor(
        mysqlHost: string,
        databaseName: string,
        username: string,
        password: string,
        EventDatabase: EventDatabase,
        UserDatabase: UserDatabase
    ) {
        let mysqlConnection = mysql.createPool({
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
    static getInstance(): CommentDatabase | undefined {
        return CommentDatabase.instance;
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
        eventDatabase: EventDatabase,
        userDatabase: UserDatabase
    ): CommentDatabase {
        if (CommentDatabase.instance === undefined) {
            CommentDatabase.instance = new CommentDatabase(mysqlHost, databaseName, username, password, eventDatabase, userDatabase);
        }

        return CommentDatabase.instance;
    }

    private getSearchQuery(parameters: Map<String, any>): string {
        let query = "";

        parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
        query = query.substring(0, query.length - 5);

        return query;
    }

    private async parseComment(result: any): Promise<IComment> {
        return Promise.resolve({
            eventID: new ObjectId(result.eventID),
            userID: new ObjectId(result.userID),
            commentID: new ObjectId(result.commentID),
            content: result.content
        });
    }

    GetAll(parameters?: Map<String, any> | undefined): Promise<Promise<IComment | null>[] | null> {
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

                    let events: Promise<IComment | null>[] = [];

                    results.forEach((result: any) => {
                        events.push(this.parseComment(result));
                    });

                    return resolve(events);
                });
            });
        });
    }

    Get(parameters: Map<String, any>): Promise<IComment | null> {
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

                    return resolve(this.parseComment(results[0]));
                });
            });
        });
    }

    Create(object: IBaseComment): Promise<IComment | null> {
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

                let commentID = new ObjectId();

                connection.query(`INSERT INTO Comment (commentID, eventID, userID, content) 
                VALUES ('${commentID.toString()}', '${object.eventID.toString()}', '${object.userID.toString()}', '${object.content}');`,
                    (err, results) => {
                        connection.release();

                        if (err) {
                            return reject(err);
                        }

                        return resolve(this.Get(new Map([["eventID", commentID]])));
                    });
            });
        });
    }

    Update(id: string, object: IBaseComment): Promise<IComment | null> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection(async (err, connection) => {
                if (err) {
                    return reject(err);
                }


                connection.query(`UPDATE Comment SET content = '${object.content}' WHERE commentID = '${id}';`,
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
