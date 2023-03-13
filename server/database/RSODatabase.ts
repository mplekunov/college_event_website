import * as dotenv from 'dotenv';
dotenv.config();

import { exit } from 'process';

import mysql from 'mysql';

import IUser from '../serverAPI/model/internal/user/IUser';
import IDatabase from './IDatabase';
import IBaseUser from '../serverAPI/model/internal/user/IBaseUser';
import IBaseRSO from '../serverAPI/model/internal/rso/IBaseRSO';
import IRSO from '../serverAPI/model/internal/rso/IRSO';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class RSODatabase implements IDatabase<IBaseRSO, IRSO> {
    private static instance?: RSODatabase;

    private mysqlConnection: mysql.Connection;

    private constructor(
        mysqlHost: string,
        databaseName: string,
        username: string,
        password: string
    ) {
        let mysqlConnection = mysql.createConnection({
            host: mysqlHost,
            database: databaseName,
            user: username,
            password: password
        });

        mysqlConnection.connect();

        this.mysqlConnection = mysqlConnection;
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

    GetAll(parameters?: Map<String, any> | undefined): Promise<IRSO[] | null> {
        throw new Error('Method not implemented.');
    }

    Get(parameters: Map<String, any>): Promise<IRSO | null> {
        throw new Error('Method not implemented.');
    }
    
    Create(object: IBaseRSO): Promise<IRSO | null> {
        throw new Error('Method not implemented.');
    }
    
    Update(id: string, object: IRSO): Promise<IRSO | null> {
        throw new Error('Method not implemented.');
    }
    
    Delete(id: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}