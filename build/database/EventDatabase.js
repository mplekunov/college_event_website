"use strict";
// import * as dotenv from 'dotenv';
// dotenv.config();
// import mysql from 'mysql';
// import IUser from '../serverAPI/model/internal/user/IUser';
// import IDatabase from './IDatabase';
// import IBaseEvent from '../serverAPI/model/internal/event/IBaseEvent';
// import IEvent from '../serverAPI/model/internal/event/IEvent';
// /**
//  * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
//  * CRUD operations on the User collection.
//  * 
//  * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
//  * execution lifetime.
//  */
// export default class EventDatabase implements IDatabase<IBaseEvent, IEvent> {
//     private static instance?: EventDatabase;
//     private mysqlConnection: mysql.Connection;
//     private constructor(
//         mysqlHost: string,
//         databaseName: string,
//         username: string,
//         password: string
//     ) {
//         let mysqlConnection = mysql.createConnection({
//             host: mysqlHost,
//             database: databaseName,
//             user: username,
//             password: password
//         });
//         mysqlConnection.connect();
//         this.mysqlConnection = mysqlConnection;
//     }
//     /**
//      * Retrieves current instance of the UserDatabase if such exists.
//      * 
//      * @returns UserDatabase object or undefined.
//      */
//     static getInstance(): EventDatabase | undefined {
//         return this.instance;
//     }
//     /**
//      * Connects to the database if database instance doesn't exist.
//      * 
//      * @returns UserDatabase object.
//      */
//     static connect(
//         mysqlHost: string,
//         databaseName: string,
//         username: string,
//         password: string
//     ): EventDatabase {
//         if (this.instance === undefined) {
//             this.instance = new EventDatabase(mysqlHost, databaseName, username, password);
//         }
//         return this.instance;
//     }
//     GetAll(parameters?: Map<String, any> | undefined): Promise<IEvent[] | null> {
//         throw new Error('Method not implemented.');
//     }
//     Get(parameters: Map<String, any>): Promise<IEvent | null> {
//         throw new Error('Method not implemented.');
//     }
//     Create(object: IBaseEvent): Promise<IEvent | null> {
//         throw new Error('Method not implemented.');
//     }
//     Update(id: string, object: IEvent): Promise<IEvent | null> {
//         throw new Error('Method not implemented.');
//     }
//     Delete(id: string): Promise<boolean> {
//         throw new Error('Method not implemented.');
//     }
// }
//# sourceMappingURL=EventDatabase.js.map