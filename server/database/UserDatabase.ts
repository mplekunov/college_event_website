import * as dotenv from 'dotenv';
dotenv.config();

import { exit } from 'process';

import mysql from 'mysql';

import IUser from '../serverAPI/model/internal/user/IUser';
import IDatabase from './IDatabase';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class UserDatabase implements IDatabase<IUser> {
    private static instance?: UserDatabase;

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

    GetAll(parameters?: Map<String, any> | undefined): Promise<IUser[] | null> {
        throw new Error('Method not implemented.');
    }

    Get(parameters: Map<String, any>): Promise<IUser | null> {
        throw new Error('Method not implemented.');
    }
    
    Create(object: IUser): Promise<IUser | null> {
        throw new Error('Method not implemented.');
    }
    
    Update(id: string, object: IUser): Promise<IUser | null> {
        throw new Error('Method not implemented.');
    }
    
    Delete(id: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}