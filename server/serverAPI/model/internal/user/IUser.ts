import { ObjectId } from "bson";
import IAffiliate from "../affiliate/IAffiliate";
import IMember from "../member/IMember";
import IBaseRSO from "../rso/IBaseRSO";
import { RSOMemberType } from "../rsoMember/RSOMemberType";
import IBaseUser from "./IBaseUser";

export default interface IUser extends IBaseUser {
    userID: ObjectId;

    organizationsAffiliation: Array<IAffiliate<IBaseRSO, IMember<RSOMemberType>>>;
}
