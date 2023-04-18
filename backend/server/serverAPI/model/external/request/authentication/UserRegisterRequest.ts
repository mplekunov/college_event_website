import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import IBaseAffiliate from "../../../internal/affiliate/IBaseAffiliate";
import BaseUserSchema from "../../../internal/user/BaseUserSchema";
import { UserLevel } from "../../../internal/user/UserLevel";
import Schema from "../../../Schema";

export default class UserRegisterRequestSchema extends Schema {
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


    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        userLevel: UserLevel
    ) {
        super();

        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.email = email;
        this.userLevel = userLevel;
        this.lastSeen = Date.now();
    }
}
