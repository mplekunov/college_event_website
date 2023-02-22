import IAffiliate from "../../../internal/affiliate/IAffiliate";
import IMember from "../../../internal/member/IMember";
import IBaseUniversity from "../../../internal/university/IBaseUniversity";
import BaseUserSchema from "../../../internal/user/BaseUserSchema";

export default class RegisterRequestSchema extends BaseUserSchema {
    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        userLevel: UserLevel,
        universityAffiliation: IAffiliate<IBaseUniversity, IMember<UniversityMemberType>>
    ) {
        super(firstName, lastName, username, password, email, userLevel, Date.now(), universityAffiliation);
    }
}
