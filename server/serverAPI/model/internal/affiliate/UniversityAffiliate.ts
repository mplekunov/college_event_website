import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import Schema from "../../Schema";
import IMember from "../member/IMember";
import IBaseUniversity from "../university/IBaseUniversity";
import { UniversityMemberType } from "../universityMember/UniversityMemberType";
import IAffiliate from "./IAffiliate";
import IBaseAffiliate from "./IBaseAffiliate";

export default class BaseUniversityAffiliateSchema extends Schema implements IBaseAffiliate<UniversityMemberType> {
    @IsString()
    @IsNotEmpty()
    organizationName: string;
    
    affiliationType: UniversityMemberType;

    constructor(organization: string, affiliationType: UniversityMemberType) {
        super();

        this.organizationName = organization;
        this.affiliationType = affiliationType;
    }
}
