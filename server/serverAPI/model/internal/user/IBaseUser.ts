import IAffiliate from "../affiliate/IAffiliate";
import IMember from "../member/IMember";
import IBaseUniversity from "../university/IBaseUniversity";

export default interface IBaseUser {
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

    universityAffiliation: IAffiliate<IBaseUniversity, IMember<UniversityMemberType>>;
}
