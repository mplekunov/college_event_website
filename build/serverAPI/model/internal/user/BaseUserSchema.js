"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const Schema_1 = __importDefault(require("../../Schema"));
class BaseUserSchema extends Schema_1.default {
    firstName;
    lastName;
    username;
    password;
    lastSeen;
    email;
    userLevel;
    universityAffiliation;
    constructor(firstName, lastName, username, password, email, userLevel, lastSeen, universityAffiliation) {
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
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseUserSchema.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseUserSchema.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseUserSchema.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseUserSchema.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsInt)()
], BaseUserSchema.prototype, "lastSeen", void 0);
__decorate([
    (0, class_validator_1.IsEmail)()
], BaseUserSchema.prototype, "email", void 0);
exports.default = BaseUserSchema;
//# sourceMappingURL=BaseUserSchema.js.map