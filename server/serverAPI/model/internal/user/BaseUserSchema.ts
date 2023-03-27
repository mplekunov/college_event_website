import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";

import Schema from "../../Schema";

import IBaseUser from "./IBaseUser";
import { UniversityMemberType } from "../universityMember/UniversityMemberType";
import { UserLevel } from "./UserLevel";
import IBaseAffiliate from "../affiliate/IBaseAffiliate";

export default class BaseUserSchema extends Schema implements IBaseUser {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsNumber()
    @IsPositive()
    @IsInt()
    lastSeen: number;

    @IsEmail()
    email: string;

    userLevel: UserLevel;

    universityAffiliation: IBaseAffiliate<UniversityMemberType>;

    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        userLevel: UserLevel,
        lastSeen: number,
        universityAffiliation: IBaseAffiliate<UniversityMemberType>
    ) {
        super();
        
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.lastSeen = lastSeen;
        this.email = email;
        this.userLevel = userLevel;
        this.universityAffiliation = universityAffiliation;
    }
}
