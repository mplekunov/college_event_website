import { ObjectId } from "bson";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import Schema from "../../Schema";
import IBaseAffiliate from "./IBaseAffiliate";

export default class BaseUniversityAffiliateSchema extends Schema implements IBaseAffiliate {
    @IsString()
    @IsNotEmpty()
    organizationName: string;    
    
    organizationID: ObjectId;

    constructor(organizationName: string, organizationID: ObjectId) {
        super();

        this.organizationName = organizationName;
        this.organizationID = organizationID;
    }
}
