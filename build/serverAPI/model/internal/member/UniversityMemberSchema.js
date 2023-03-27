"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(require("../../Schema"));
class UniversityMemberSchema extends Schema_1.default {
    userID;
    organizationID;
    memberType;
    constructor(userID, organizationID, memberType) {
        super();
        this.userID = userID;
        this.organizationID = organizationID;
        this.memberType = memberType;
    }
}
exports.default = UniversityMemberSchema;
//# sourceMappingURL=UniversityMemberSchema.js.map