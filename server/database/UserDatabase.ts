import * as dotenv from 'dotenv';
dotenv.config();

import { exit } from 'process';

import mysql from 'mysql';

import IUser from '../serverAPI/model/internal/user/IUser';
import IDatabase from './IDatabase';
import IBaseUser from '../serverAPI/model/internal/user/IBaseUser';
import { ObjectId } from 'bson';
import IUniversity from '../serverAPI/model/internal/university/IUniversity';
import IBaseUniversity from '../serverAPI/model/internal/university/IBaseUniversity';
import IAffiliate from '../serverAPI/model/internal/affiliate/IAffiliate';
import IMember from '../serverAPI/model/internal/member/IMember';
import IBaseRSO from '../serverAPI/model/internal/rso/IBaseRSO';
import { UniversityMemberType } from '../serverAPI/model/internal/universityMember/UniversityMemberType';
import { RSOMemberType } from '../serverAPI/model/internal/rsoMember/RSOMemberType';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class UserDatabase implements IDatabase<IBaseUser, IUser> {
    private static instance?: UserDatabase;

    private mysqlPool: mysql.Pool;

    private constructor(
        mysqlHost: string,
        databaseName: string,
        username: string,
        password: string
    ) {
        let mysqlConnection = mysql.createPool({
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
        password: string
    ): UserDatabase {
        if (UserDatabase.instance === undefined) {
            UserDatabase.instance = new UserDatabase(mysqlHost, databaseName, username, password);
        }

        return UserDatabase.instance;
    }

    private parseUser(result: any): IUser {
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

    private parseOrganizations(result: any): IAffiliate<IBaseRSO, IMember<RSOMemberType>>[] {
        return [];
    }

    private parseUniversity(result: any): IAffiliate<IBaseUniversity, IMember<UniversityMemberType>> {
        return {
            affiliationType: {
                memberType: UniversityMemberType.STUDENT,
                organizationID: new ObjectId(),
                userID: new ObjectId()
            }, organization: { description: "", location: { address: "", latitude: 0, longitude: 0 }, name: "", numStudents: 0, universityID: new ObjectId() }
        };
    }

    async GetAll(parameters?: Map<String, any> | undefined): Promise<IUser[] | null> {
        await this.mysqlPool.query(`SELECT * FROM User`,  (error, results, fields) => {
            if (error || !Array.isArray(results) || results.length === 0) {
                return Promise.resolve(null);
            }

            let users: IUser[] = [];

            results.forEach((element: any) => users.push(this.parseUser(element)));

            return Promise.resolve(users);
        });

        return Promise.resolve(null);
    }

    private getSearchQuery(parameters: Map<String, any>): string {
        let query = "";

        parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
        query = query.substring(0, query.length - 5);

        return query;
    }

    async Get(parameters: Map<String, any>): Promise<IUser | null> {
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

    async Create(object: IUser): Promise<IUser | null> {
        return new Promise<IUser | null>((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }

                connection.query(`INSERT INTO User (userID, firstName, lastName, lastSeen, userLevel, username, password, email) 
                VALUES('${object.userID.toString()}', '${object.firstName}', '${object.lastName}', ${object.lastSeen}, ${object.userLevel}, '${object.username}', '${object.password}', '${object.email}');`,
                    async (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(error);
                        }

                        return resolve(this.Get(new Map([['userID', object.userID.toString()]])));
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
                            return reject(error);
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
                    return reject(err);
                }

                connection.query(`DELETE FROM User WHERE userID = '${id}';`,
                    async (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(error);
                        }

                        return results.affectedRows === 0 ? resolve(false) : resolve(true);
                    }
                );
            });
        });
    }
}
