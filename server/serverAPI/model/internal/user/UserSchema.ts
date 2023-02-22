import IUser from "./IUser";

import BaseUserSchema from "./BaseUserSchema";
import IAffiliate from "../affiliate/IAffiliate";
import IBaseUniversity from "../university/IBaseUniversity";
import IMember from "../member/IMember";
import IBaseRSO from "../rso/IBaseRSO";

export default class UserSchema extends BaseUserSchema implements IUser {
    userID: number;

    organizationsAffiliation: IAffiliate<IBaseRSO, IMember<RSOMemberType>>[];

    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        userLevel: UserLevel,
        lastSeen: number,
        userID: number,
        universityAffiliation: IAffiliate<IBaseUniversity, IMember<UniversityMemberType>>,
        organizationsAffiliation: IAffiliate<IBaseRSO, IMember<RSOMemberType>>[]
    ) {
        super(firstName, lastName, username, password, email, userLevel, lastSeen, universityAffiliation);
        
        this.organizationsAffiliation = organizationsAffiliation;
        this.userID = userID;
    }
}
