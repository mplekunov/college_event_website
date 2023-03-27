import IUser from "./IUser";

import BaseUserSchema from "./BaseUserSchema";
import { ObjectId } from "bson";
import { RSOMemberType } from "../rsoMember/RSOMemberType";
import { UniversityMemberType } from "../universityMember/UniversityMemberType";
import { UserLevel } from "./UserLevel";
import IBaseAffiliate from "../affiliate/IBaseAffiliate";

export default class UserSchema extends BaseUserSchema implements IUser {
    userID: ObjectId;

    organizationsAffiliation: IBaseAffiliate<RSOMemberType>[];

    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        userLevel: UserLevel,
        lastSeen: number,
        userID: ObjectId,
        universityAffiliation: IBaseAffiliate<UniversityMemberType>,
        organizationsAffiliation: IBaseAffiliate<RSOMemberType>[]
    ) {
        super(firstName, lastName, username, password, email, userLevel, lastSeen, universityAffiliation);
        
        this.organizationsAffiliation = organizationsAffiliation;
        this.userID = userID;
    }
}
