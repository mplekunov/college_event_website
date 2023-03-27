import IAffiliate from "../../../internal/affiliate/IAffiliate";
import IMember from "../../../internal/member/IMember";
import IBaseUniversity from "../../../internal/university/IBaseUniversity";
import { UniversityMemberType } from "../../../internal/universityMember/UniversityMemberType";
import { UserLevel } from "../../../internal/user/UserLevel";

export default interface IUserResponse {
    username: string;
    firstName: string;
    lastName: string;
    lastSeen: number;
    email: string;
    userLevel: UserLevel;
    universityAffiliation: IAffiliate<IBaseUniversity, IMember<UniversityMemberType>>;
}
