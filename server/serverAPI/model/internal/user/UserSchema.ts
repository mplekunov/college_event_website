import IUser from "./IUser";

import BaseUserSchema from "./BaseUserSchema";
import { ObjectId } from "bson";
import { UserLevel } from "./UserLevel";
import IBaseAffiliate from "../affiliate/IBaseAffiliate";

export default class UserSchema extends BaseUserSchema implements IUser {
    userID: ObjectId;

    organizationsAffiliation: IBaseAffiliate[];

    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        userLevel: UserLevel,
        lastSeen: number,
        userID: ObjectId,
        universityAffiliation: IBaseAffiliate,
        organizationsAffiliation: IBaseAffiliate[]
    ) {
        super(firstName, lastName, username, password, email, userLevel, lastSeen, universityAffiliation);
        
        this.organizationsAffiliation = organizationsAffiliation;
        this.userID = userID;
    }
}
