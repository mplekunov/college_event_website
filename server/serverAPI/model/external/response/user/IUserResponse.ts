import IBaseAffiliate from "../../../internal/affiliate/IBaseAffiliate";
import { UniversityMemberType } from "../../../internal/universityMember/UniversityMemberType";
import { UserLevel } from "../../../internal/user/UserLevel";

export default interface IUserResponse {
    username: string;
    firstName: string;
    lastName: string;
    lastSeen: number;
    email: string;
    userLevel: UserLevel;
    universityAffiliation: IBaseAffiliate<UniversityMemberType>;
}
