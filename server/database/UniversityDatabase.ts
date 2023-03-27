import * as dotenv from 'dotenv';
dotenv.config();

import { exit } from 'process';

import mysql from 'mysql';

import IDatabase from './IDatabase';
import { ObjectId } from 'bson';
import IUniversity from '../serverAPI/model/internal/university/IUniversity';
import IBaseUniversity from '../serverAPI/model/internal/university/IBaseUniversity';
import ILocation from '../serverAPI/model/internal/location/ILocation';
import IBaseLocation from '../serverAPI/model/internal/location/IBaseLocation';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class UniversityDatabase implements IDatabase<IBaseUniversity, IUniversity> {
    private static instance?: UniversityDatabase;
    private static locationDatabase: IDatabase<IBaseLocation, ILocation>;

    private mysqlPool: mysql.Pool;

    private constructor(
        mysqlHost: string,
        databaseName: string,
        username: string,
        password: string,
        locationDatabase: IDatabase<IBaseLocation, ILocation>,
    ) {
        let mysqlConnection = mysql.createPool({
            host: mysqlHost,
            database: databaseName,
            user: username,
            password: password
        });

        UniversityDatabase.locationDatabase = locationDatabase;
        this.mysqlPool = mysqlConnection;
    }

    /**
     * Retrieves current instance of the UserDatabase if such exists.
     * 
     * @returns UserDatabase object or undefined.
     */
    static getInstance(): UniversityDatabase | undefined {
        return UniversityDatabase.instance;
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
        locationDatabase: IDatabase<IBaseLocation, ILocation>
    ): UniversityDatabase {
        if (UniversityDatabase.instance === undefined) {
            UniversityDatabase.instance = new UniversityDatabase(mysqlHost, databaseName, username, password, locationDatabase);
        }

        return UniversityDatabase.instance;
    }

    private async parseUniversity(result: any): Promise<IUniversity> {
        let location: ILocation | null;

        try {
            location = await UniversityDatabase.locationDatabase.Get(new Map([['locationID', result.locationID]]));
            
            if (location === null) {
                return Promise.reject("Location not found");
            }
        } catch(response) {
            return Promise.reject(response);
        }
        
        return {
            description: result.description,
            location: location, 
            name: result.name,
            numStudents: result.numStudents,
            universityID: new ObjectId(result.universityID),
            pictures: []
        };
    }
    
    async GetAll(parameters?: Map<String, any> | undefined): Promise<IUniversity[] | null> {
        await this.mysqlPool.query(`SELECT * FROM User`,  (error, results, fields) => {
            if (error || !Array.isArray(results) || results.length === 0) {
                return Promise.resolve(null);
            }

            let universities: IUniversity[] = [];

            results.forEach(async (element: any) => universities.push(await this.parseUniversity(element)));

            return Promise.resolve(universities);
        });

        return Promise.resolve(null);
    }

    private getSearchQuery(parameters: Map<String, any>): string {
        let query = "";

        parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
        query = query.substring(0, query.length - 5);

        return query;
    }

    async Get(parameters: Map<String, any>): Promise<IUniversity | null> {
        let query = this.getSearchQuery(parameters);

        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }
    
                connection.query(`SELECT * FROM University WHERE ${query} LIMIT 1;`, (error, results, fields) => {
                    connection.release();
    
                    if (error || !Array.isArray(results) || results.length === 0) {
                        return resolve(null);
                    }
                    
                    return resolve(this.parseUniversity(results[0]));
                });
            });
        });
    }

    async Create(object: IBaseUniversity): Promise<IUniversity | null> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection(async (err, connection) => {
                if (err) {
                    return reject(err);
                }

                let location = await UniversityDatabase.locationDatabase.Get(new Map([['address', object.location.address]]));

                if (location === null) {
                    location = await UniversityDatabase.locationDatabase.Create(object.location);

                    if (location === null) {
                        return reject("Failed to create location");
                    }
                }

                connection.query(`INSERT INTO University (universityID, name, description, locationID, numStudents) 
                VALUES('${(new ObjectId()).toString()}', '${object.name}', '${object.description}', '${location.locationID.toString()}', ${object.numStudents});`,
                    async (error, results, fields) => {
                        connection.release();

                        if (error) {
                            console.log(error);
                            console.log(location);
                            return reject(error);
                        }

                        return resolve(this.Get(new Map([['name', object.name]])));
                    }
                );
            });
        });
    }

    Update(id: string, object: IBaseUniversity): Promise<IUniversity | null> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }

                connection.query(`UPDATE University SET name = '${object.name}', description = '${object.description}', numStudents = ${object.numStudents} WHERE universityID = '${id}';`,
                    async (error, results, fields) => {
                        connection.release();

                        if (error) {
                            return reject(error);
                        }

                        return resolve(this.Get(new Map([['universityID', id]])));
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

                connection.query(`DELETE FROM University WHERE universityID = '${id}';`,
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
