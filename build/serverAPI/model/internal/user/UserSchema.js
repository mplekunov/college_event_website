"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseUserSchema_1 = __importDefault(require("./BaseUserSchema"));
class UserSchema extends BaseUserSchema_1.default {
    isVerified;
    constructor(firstName, lastName, username, password, email, userLevel, lastSeen) {
        super(firstName, lastName, username, password, email, userLevel, lastSeen);
        this.isVerified = false;
    }
}
exports.default = UserSchema;
//# sourceMappingURL=UserSchema.js.map