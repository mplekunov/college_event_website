import { ObjectId } from "bson";
import { IsEnum, IsString } from "class-validator";
import Schema from "../../Schema";
import { UniversityMemberType } from "../universityMember/UniversityMemberType";
import IMember from "./IMember";

export default class UniversityMemberSchema extends Schema implements IMember<UniversityMemberType> {
    userID: ObjectId;
    
    organizationID: ObjectId;
    
    memberType: UniversityMemberType;

    constructor(userID: ObjectId, organizationID: ObjectId, memberType: UniversityMemberType) {
        super();

        this.userID = userID;
        this.organizationID = organizationID;
        this.memberType = memberType;
    }
}
