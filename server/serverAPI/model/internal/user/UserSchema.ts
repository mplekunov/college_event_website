import IUser from "./IUser";

import BaseUserSchema from "./BaseUserSchema";

export default class UserSchema extends BaseUserSchema implements IUser {

    isVerified: boolean;

    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        userLevel: UserLevel,
        lastSeen: number
    ) {
        super(firstName, lastName, username, password, email, userLevel, lastSeen);
        
        this.isVerified = false;
    }
}
