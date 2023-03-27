import { ValidateNested } from "class-validator";
import Schema from "../../Schema";
import IMember from "../member/IMember";
import IBaseUniversity from "../university/IBaseUniversity";
import { UniversityMemberType } from "../universityMember/UniversityMemberType";
import IAffiliate from "./IAffiliate";

export default class BaseUniversityAffiliateSchema extends Schema implements IAffiliate<IBaseUniversity, IMember<UniversityMemberType>> {
    @ValidateNested()
    organization: IBaseUniversity;
    
    @ValidateNested()
    affiliationType: IMember<UniversityMemberType>;

    constructor(organization: IBaseUniversity, affiliationType: IMember<UniversityMemberType>) {
        super();

        this.organization = organization;
        this.affiliationType = affiliationType;
    }
}
