import BaseUserSchema from "../../../internal/user/BaseUserSchema";

export default class RegisterRequestSchema extends BaseUserSchema {
    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        userLevel: UserLevel
    ) {
        super(firstName, lastName, username, password, email, userLevel, Date.now())
    }
}
