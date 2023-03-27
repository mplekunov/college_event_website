import IUser from "./IUser";

import BaseUserSchema from "./BaseUserSchema";
import IAffiliate from "../affiliate/IAffiliate";
import IBaseUniversity from "../university/IBaseUniversity";
import IMember from "../member/IMember";
import IBaseRSO from "../rso/IBaseRSO";
import { ObjectId } from "bson";
import { RSOMemberType } from "../rsoMember/RSOMemberType";
import { UniversityMemberType } from "../universityMember/UniversityMemberType";
import { UserLevel } from "./UserLevel";

export default class UserSchema extends BaseUserSchema implements IUser {
    userID: ObjectId;

    organizationsAffiliation: IAffiliate<IBaseRSO, IMember<RSOMemberType>>[];

    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        userLevel: UserLevel,
        lastSeen: number,
        userID: ObjectId,
        universityAffiliation: IAffiliate<IBaseUniversity, IMember<UniversityMemberType>>,
        organizationsAffiliation: IAffiliate<IBaseRSO, IMember<RSOMemberType>>[]
    ) {
        super(firstName, lastName, username, password, email, userLevel, lastSeen, universityAffiliation);
        
        this.organizationsAffiliation = organizationsAffiliation;
        this.userID = userID;
    }
}
