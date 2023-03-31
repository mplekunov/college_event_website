import * as dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql';

import IDatabase from './IDatabase';
import IBaseRSO from '../serverAPI/model/internal/rso/IBaseRSO';
import IRSO from '../serverAPI/model/internal/rso/IRSO';
import { ObjectId } from 'bson';
import { RSOMemberType } from '../serverAPI/model/internal/rsoMember/RSOMemberType';
import IMember from '../serverAPI/model/internal/member/IMember';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class RSODatabase implements IDatabase<IBaseRSO, IRSO> {
    private static instance?: RSODatabase;

    private mysqlPool: mysql.Pool;

    private constructor(
        mysqlHost: string,
        databaseName: string,
        username: string,
        password: string
    ) {
        let mysqlPool = mysql.createPool({
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
    static getInstance(): RSODatabase | undefined {
        return this.instance;
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
        password: string
    ): RSODatabase {
        if (this.instance === undefined) {
            this.instance = new RSODatabase(mysqlHost, databaseName, username, password);
        }

        return this.instance;
    }

    private getSearchQuery(parameters: Map<String, any>): string {
        let query = "";

        parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
        query = query.substring(0, query.length - 5);

        return query;
    }

    private getUserRSO(userID: ObjectId): Promise<Promise<IRSO | null>[]> {
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

                    let rsos: Promise<IRSO | null>[] = [];

                    results.forEach((member: any) => {
                        rsos.push(this.Get(new Map([["rsoID", member.rsoID]])));
                    });

                    return resolve(rsos);
                });
            });
        });
    }

    private getMembers(rsoID: ObjectId): Promise<IMember<RSOMemberType>[]> {
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

                    let members: IMember<RSOMemberType>[] = [];

                    results.forEach((member: any) => {
                        members.push({
                            userID: new ObjectId(member.userID),
                            memberType: member.memberType as RSOMemberType,
                        });
                    });

                    return resolve(members);
                });
            });
        });
    }

    private addMember(rsoID: ObjectId, userID: ObjectId, memberType: RSOMemberType, rsoName: string): Promise<IRSO | null> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }

                connection.query(`INSERT INTO RSO_Members (rsoID, userID, memberType, rsoName)
                VALUES ('${rsoID.toString()}', '${userID.toString()}', ${memberType}, '${rsoName}');`,
                    (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(`RSODatabase: ${error}`);
                        }

                        return resolve(this.Get(new Map<string, any>([['rsoID', rsoID]])));
                    });
            });
        });
    }

    private deleteMember(rsoID: ObjectId, userID: ObjectId): Promise<IRSO | null> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }

                connection.query(`DELETE FROM RSO_Members WHERE rsoID = '${rsoID.toString()}' AND userID = '${userID.toString()}';`,
                    (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(`RSODatabase: ${error}`);
                        }

                        return resolve(this.Get(new Map<string, any>([['rsoID', rsoID]])));
                    });
            });
        });
    }

    private async parseRSO(result: any): Promise<IRSO> {
        let rsoID = new ObjectId(result.rsoID);

        return {
            rsoID: new ObjectId(rsoID),
            name: result.name,
            description: result.description,
            members: await this.getMembers(rsoID)
        };
    }

    GetAll(parameters?: Map<String, any> | undefined): Promise<Promise<IRSO | null>[]> {
        if (parameters?.has('userID')) {
            return Promise.resolve(this.getUserRSO(new ObjectId(parameters.get('userID'))!));
        }

        throw new Error('Method not implemented.');
    }

    Get(parameters: Map<String, any>): Promise<IRSO | null> {
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

    Create(object: IBaseRSO): Promise<IRSO | null> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection(async (err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }

                let rsoID = new ObjectId();

                if (await this.Get(new Map([["name", object.name]])) !== null) {
                    return reject(`RSODatabase: RSO with such name already exists`);
                }

                connection.query(`INSERT INTO RSO (rsoID, name, description) 
                VALUES ('${rsoID.toString()}', '${object.name}', '${object.description}');`,
                    async (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(`RSODatabase: ${error}`);
                        }

                        try {
                            let members = new Set((await this.getMembers(rsoID)).flatMap((member: IMember<RSOMemberType>) => member.userID.toString()));

                            for (const member of object.members) {
                                if (!members.has(member.userID.toString())) {
                                    await this.addMember(rsoID, member.userID, member.memberType, object.name);
                                }
                            }
                        } catch (error) {
                            return reject(`RSODatabase: ${error}`);
                        }

                        return resolve(this.Get(new Map<string, any>([['rsoID', rsoID.toString()]])));
                    });
            });
        });
    }

    Update(id: string, object: IBaseRSO): Promise<IRSO | null> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }

                connection.query(`UPDATE RSO SET name = '${object.name}', description = '${object.description}' WHERE rsoID = '${id}';`,
                    async (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(`RSODatabase: ${error}`);
                        }

                        try {
                            let members = await this.getMembers(new ObjectId(id));

                            for (const member of members) {
                                await this.deleteMember(new ObjectId(id), member.userID);
                            }

                            for (const member of object.members) {
                                await this.addMember(new ObjectId(id), member.userID, member.memberType, object.name);
                            }
                        } catch (error) {
                            return reject(`RSODatabase: ${error}`);
                        }

                        return resolve(this.Get(new Map<string, any>([['rsoID', id]])));
                    });
            });
        });
    }

    Delete(id: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`RSODatabase: ${err}`);
                }

                connection.query(`DELETE FROM RSO WHERE rsoID = '${id}';`,
                    (error, results, fields) => {
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