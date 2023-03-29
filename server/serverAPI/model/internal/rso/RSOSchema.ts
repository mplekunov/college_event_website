import IMember from "../member/IMember";
import { ObjectId } from "bson";
import Schema from "../../Schema";
import { RSOMemberType } from "../rsoMember/RSOMemberType";
import IBaseRSO from "./IBaseRSO";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export default class BaseRSOSchema extends Schema implements IBaseRSO {
    @IsArray()
    @ValidateNested()
    members: IMember<RSOMemberType>[];
    
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    constructor(
        name: string,
        description: string,
        members: IMember<RSOMemberType>[]
    ) {
        super();
        
        this.name = name;
        this.description = description;
        this.members = members;
    }
}
