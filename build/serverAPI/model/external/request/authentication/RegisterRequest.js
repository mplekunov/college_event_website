"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseUserSchema_1 = __importDefault(require("../../../internal/user/BaseUserSchema"));
class RegisterRequestSchema extends BaseUserSchema_1.default {
    constructor(firstName, lastName, username, password, email, userLevel, universityAffiliation) {
        super(firstName, lastName, username, password, email, userLevel, Date.now(), universityAffiliation);
    }
}
exports.default = RegisterRequestSchema;
//# sourceMappingURL=RegisterRequest.js.map