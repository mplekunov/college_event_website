import IAffiliate from "../affiliate/IAffiliate";
import IBaseAffiliate from "../affiliate/IBaseAffiliate";
import IMember from "../member/IMember";
import IBaseUniversity from "../university/IBaseUniversity";
import { UniversityMemberType } from "../universityMember/UniversityMemberType";
import IContactInformation from "./IContactInformation";
import ICredentials from "./ICredentials";
import { UserLevel } from "./UserLevel";

export default interface IBaseUser extends ICredentials, IContactInformation {
    /**
     * User's first name.
     */
    firstName: string;

    /**
     * User's last name.
     */
    lastName: string;

    /**
     * Last time user has been seen in seconds since Unix epoch.
     */
    lastSeen: number;

    /**
     * The User's level of access
     */
    userLevel: UserLevel;

    universityAffiliation: IBaseAffiliate<UniversityMemberType>;
}
