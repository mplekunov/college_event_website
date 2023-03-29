"use strict";
// import * as dotenv from 'dotenv';
// dotenv.config();
// import { exit } from 'process';
// import mysql from 'mysql';
// import IUser from '../serverAPI/model/internal/user/IUser';
// import IDatabase from './IDatabase';
// import IBaseUser from '../serverAPI/model/internal/user/IBaseUser';
// import { ObjectId } from 'bson';
// import IUniversity from '../serverAPI/model/internal/university/IUniversity';
// import IBaseUniversity from '../serverAPI/model/internal/university/IBaseUniversity';
// import IAffiliate from '../serverAPI/model/internal/affiliate/IAffiliate';
// import IMember from '../serverAPI/model/internal/member/IMember';
// import IBaseRSO from '../serverAPI/model/internal/rso/IBaseRSO';
// import { UniversityMemberType } from '../serverAPI/model/internal/universityMember/UniversityMemberType';
// import { RSOMemberType } from '../serverAPI/model/internal/rsoMember/RSOMemberType';
// import ILocation from '../serverAPI/model/internal/location/ILocation';
// import IBaseLocation from '../serverAPI/model/internal/location/IBaseLocation';
// /**
//  * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
//  * CRUD operations on the User collection.
//  * 
//  * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
//  * execution lifetime.
//  */
// export default class PictureDatabase implements IDatabase<Imag, ILocation> {
//     private static instance?: PictureDatabase;
//     private mysqlPool: mysql.Pool;
//     private constructor(
//         mysqlHost: string,
//         databaseName: string,
//         username: string,
//         password: string
//     ) {
//         let mysqlConnection = mysql.createPool({
//             host: mysqlHost,
//             database: databaseName,
//             user: username,
//             password: password
//         });
//         this.mysqlPool = mysqlConnection;
//     }
//     /**
//      * Retrieves current instance of the UserDatabase if such exists.
//      * 
//      * @returns UserDatabase object or undefined.
//      */
//     static getInstance(): PictureDatabase | undefined {
//         return PictureDatabase.instance;
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
//     ): PictureDatabase {
//         if (PictureDatabase.instance === undefined) {
//             PictureDatabase.instance = new PictureDatabase(mysqlHost, databaseName, username, password);
//         }
//         return PictureDatabase.instance;
//     }
//     private parseLocation(result: any): ILocation {
//         return {
//             locationID: new ObjectId(),
//             address: "",
//             latitude: 0,
//             longitude: 0
//         };
//     }
//     async GetAll(parameters?: Map<String, any> | undefined): Promise<ILocation[] | null> {
//         await this.mysqlPool.query(`SELECT * FROM Location`,  (error, results, fields) => {
//             if (error || !Array.isArray(results) || results.length === 0) {
//                 return Promise.resolve(null);
//             }
//             let locations: ILocation[] = [];
//             results.forEach((element: any) => locations.push(this.parseLocation(element)));
//             return Promise.resolve(locations);
//         });
//         return Promise.resolve(null);
//     }
//     private getSearchQuery(parameters: Map<String, any>): string {
//         let query = "";
//         parameters.forEach((value, key) => query += `${key} = '${value}' AND `);
//         query = query.substring(0, query.length - 5);
//         return query;
//     }
//     async Get(parameters: Map<String, any>): Promise<ILocation | null> {
//         let query = this.getSearchQuery(parameters);
//         return new Promise((resolve, reject) => {
//             this.mysqlPool.getConnection((err, connection) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 connection.query(`SELECT * FROM Location WHERE ${query} LIMIT 1;`, (error, results, fields) => {
//                     connection.release();
//                     if (error || !Array.isArray(results) || results.length === 0) {
//                         return resolve(null);
//                     }
//                     return resolve(this.parseLocation(results[0]));
//                 });
//             });
//         });
//     }
//     async Create(object: ILocation): Promise<ILocation | null> {
//         return new Promise((resolve, reject) => {
//             this.mysqlPool.getConnection((err, connection) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 connection.query(`INSERT INTO Location (locationID, address, longitude, latitude) 
//                 VALUES('${object.locationID.toString()}', '${object.address}', ${object.longitude}, ${object.latitude});`,
//                     async (error, results, fields) => {
//                         connection.release();
//                         if (error) {
//                             return reject(error);
//                         }
//                         return resolve(this.Get(new Map([['locationID', object.locationID.toString()]])));
//                     }
//                 );
//             });
//         });
//     }
//     Update(id: string, object: IBaseLocation): Promise<ILocation | null> {
//         return new Promise((resolve, reject) => {
//             this.mysqlPool.getConnection((err, connection) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 connection.query(`UPDATE Location SET address = '${object.address}', longitude = ${object.longitude}, latitude = ${object.latitude}' WHERE locationID = '${id}';`,
//                     async (error, results, fields) => {
//                         connection.release();
//                         if (error) {
//                             return reject(error);
//                         }
//                         return resolve(this.Get(new Map([['locationID', id]])));
//                     }
//                 );
//             });
//         });
//     }
//     Delete(id: string): Promise<boolean> {
//         return new Promise<boolean>((resolve, reject) => {
//             this.mysqlPool.getConnection((err, connection) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 connection.query(`DELETE FROM Location WHERE locationID = '${id}';`,
//                     async (error, results, fields) => {
//                         connection.release();
//                         if (error) {
//                             return reject(error);
//                         }
//                         return results.affectedRows === 0 ? resolve(false) : resolve(true);
//                     }
//                 );
//             });
//         });
//     }
// }
//# sourceMappingURL=PictureDatabase.js.map