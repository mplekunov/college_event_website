import { ObjectId } from "bson";
import IBaseAffiliate from "../../../internal/affiliate/IBaseAffiliate";
import { UserLevel } from "../../../internal/user/UserLevel";

export default interface IUserResponse {
    userID: ObjectId;
    username: string;
    firstName: string;
    lastName: string;
    lastSeen: number;
    email: string;
    userLevel: UserLevel;
    universityAffiliation: IBaseAffiliate;
}
