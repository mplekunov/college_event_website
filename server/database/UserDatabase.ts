import * as dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql';

import IUser from '../serverAPI/model/internal/user/IUser';
import IDatabase from './IDatabase';
import IBaseUser from '../serverAPI/model/internal/user/IBaseUser';
import IBaseUniversity from '../serverAPI/model/internal/university/IBaseUniversity';
import IUniversity from '../serverAPI/model/internal/university/IUniversity';
import { ObjectId } from 'bson';
import IBaseAffiliate from '../serverAPI/model/internal/affiliate/IBaseAffiliate';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class UserDatabase implements IDatabase<IBaseUser, IUser> {
    private static instance?: UserDatabase;
    private static universityDatabase: IDatabase<IBaseUniversity, IUniversity>;

    private mysqlPool: mysql.Pool;

    private constructor(
        mysqlHost: string,
        databaseName: string,
        username: string,
        password: string,
        universityDatabase: IDatabase<IBaseUniversity, IUniversity>
    ) {
        let mysqlConnection = mysql.createPool({
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
    static getInstance(): UserDatabase | undefined {
        return UserDatabase.instance;
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
        universityDatabase: IDatabase<IBaseUniversity, IUniversity>
    ): UserDatabase {
        if (UserDatabase.instance === undefined) {
            UserDatabase.instance = new UserDatabase(mysqlHost, databaseName, username, password, universityDatabase);
        }

        return UserDatabase.instance;
    }

    private async parseUser(result: any): Promise<IUser> {
        let universityAffiliation;
        let organizationsAffiliation;

        try {
            universityAffiliation = await this.parseUniversity(result);
            organizationsAffiliation = await this.parseOrganizations(result)
        } catch (error) {
            return Promise.reject(`UserDatabase: ${error}`);
        }

        return {
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            lastSeen: result.lastSeen,
            username: result.username,
            password: result.password,
            userID: new ObjectId(result.userID),
            userLevel: result.userLevel,
            universityAffiliation: universityAffiliation,
            organizationsAffiliation: organizationsAffiliation
        };
    }

    private async parseOrganizations(result: any): Promise<IBaseAffiliate[]> {
        let memberInfo: any;

        try {
            memberInfo = await new Promise((resolve, reject) =>
                this.mysqlPool.getConnection((err, connection) => {
                    if (err) {
                        return reject(`UserDatabase: ${err}`);
                    }

                    connection.query(`SELECT * FROM RSO_Members WHERE userID = '${result.userID}';`,
                        (error, results, fields) => {
                            connection.release();

                            if (error || !Array.isArray(results) || results.length === 0) {
                                return resolve([]);
                            }

                            return resolve(results);
                        });
                })
            );
        } catch (error) {
            return Promise.reject(error);
        }

        let organizations: IBaseAffiliate[] = [];

        memberInfo.forEach(async (element: any) => {
            organizations.push({
                organizationName: element.organizationName,
                organizationID: new ObjectId(element.rsoID)
            });
        });

        return organizations;
    }

    private async getUniversityMemberInfo(userID: ObjectId): Promise<any> {
        return new Promise((resolve, reject) =>
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`UserDatabase: ${err}`);
                }

                connection.query(`SELECT * FROM University_Members WHERE userID = '${userID.toString()}';`,
                    (error, results, fields) => {
                        connection.release();

                        if (error || !Array.isArray(results) || results.length === 0) {
                            return reject("UserDatabase: Could not find university member info.");
                        }


                        return resolve(results[0]);
                    });
            })
        );
    }

    private async createUniveristyMemberInfo(userID: ObjectId, universityID: ObjectId, universityName: string): Promise<any> {
        return new Promise((resolve, reject) =>
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`UserDatabase: ${err}`);
                }

                connection.query(`INSERT INTO University_Members (userID, universityID, universityName) 
                VALUES('${userID.toString()}', '${universityID.toString()}', '${universityName}');`,
                    (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject("UserDatabase: Could not create university member info.");
                        }

                        return resolve(this.getUniversityMemberInfo(userID));
                    });
            })
        );
    }

    private async parseUniversity(result: any): Promise<IBaseAffiliate> {
        let memberInfo: any;

        try {
            memberInfo = await this.getUniversityMemberInfo(result.userID);
        } catch (error) {
            return Promise.reject(`UserDatabase: ${error}`);
        }

        return {
            organizationName: memberInfo.universityName,
            organizationID: new ObjectId(memberInfo.universityID)
        };
    }

    async GetAll(parameters?: Map<String, any> | undefined): Promise<Promise<IUser | null>[] | null> {
        let query = parameters ? this.getSearchQuery(parameters) : "";

        return new Promise((resolve, reject) => this.mysqlPool.getConnection((err, connection) => {
            if (err) {
                return reject(`UserDatabase: ${err}`);
            }

            connection.query(`SELECT * FROM User WHERE ${query}`, (error, results, fields) => {
                connection.release();

                if (error || !Array.isArray(results) || results.length === 0) {
                    return resolve([]);
                }

                let users: Promise<IUser>[] = [];

                results.forEach(async (element: any) => users.push(this.parseUser(element)));

                return resolve(users);
            });
        }));
    }

    private getSearchQuery(parameters: Map<String, any>): string {
        let query = "";

        parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
        query = query.substring(0, query.length - 5);

        return query;
    }

    async Get(parameters: Map<String, any>): Promise<IUser | null> {
        let query = parameters ? this.getSearchQuery(parameters) : "";

        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`UserDatabase: ${err}`);
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

    async Create(object: IBaseUser): Promise<IUser | null> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection(async (err, connection) => {
                if (err) {
                    return reject(`UserDatabase: ${err}`);
                }

                let university: IUniversity | null;

                try {
                    university = await UserDatabase.universityDatabase.Get(new Map([['universityID', object.universityAffiliation.organizationID]]));
                } catch (response) {
                    return reject(`UserDatabase: ${response}`);
                }

                let userID = new ObjectId();

                if (university === null) {
                    return reject('UserDatabase: University could not be found.');
                }

                connection.query(`INSERT INTO User (userID, firstName, lastName, lastSeen, userLevel, username, password, email) 
                VALUES('${userID.toString()}', '${object.firstName}', '${object.lastName}', ${object.lastSeen}, ${object.userLevel}, '${object.username}', '${object.password}', '${object.email}');`,
                    async (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(`UserDatabase: ${error}`);
                        }

                        try {
                            if (university === null) {
                                return reject('UserDatabase: University could not be found.');
                            }

                            await this.createUniveristyMemberInfo(userID, university.universityID, university.name);

                            let user = await this.Get(new Map([['username', object.username]]));

                            if (user === null) {
                                return reject('UserDatabase: User could not be found.');
                            }

                            return resolve(user);
                        } catch (error) {
                            return reject(`UserDatabase: ${error}`);
                        }
                    }
                );
            });
        });
    }

    Update(id: string, object: IBaseUser): Promise<IUser | null> {
        return new Promise<IUser | null>((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }

                connection.query(`UPDATE User SET firstName = '${object.firstName}', lastName = '${object.lastName}', lastSeen = ${object.lastSeen}, userLevel = ${object.userLevel}, username = '${object.username}', password = '${object.password}', email = '${object.email}' WHERE userID = '${id}';`,
                    async (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(`UserDatabase: ${error}`);
                        }

                        return resolve(this.Get(new Map([['userID', id]])));
                    }
                );
            });
        });
    }

    Delete(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(`UserDatabase: ${err}`);
                }

                connection.query(`DELETE FROM User WHERE userID = '${id}';`,
                    async (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(`UserDatabase: ${error}`);
                        }

                        return results.affectedRows === 0 ? resolve(false) : resolve(true);
                    }
                );
            });
        });
    }
}
