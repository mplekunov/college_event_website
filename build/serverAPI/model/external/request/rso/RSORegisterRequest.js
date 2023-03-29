"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RSOSchema_1 = __importDefault(require("../../../internal/rso/RSOSchema"));
class RSORegisterRequestSchema extends RSOSchema_1.default {
    constructor(name, description, members) {
        let internalMembers = [];
        members.forEach((member) => internalMembers.push({
            memberType: member.memberType,
            userID: member.userID,
        }));
        super(name, description, internalMembers);
    }
}
exports.default = RSORegisterRequestSchema;
//# sourceMappingURL=RSORegisterRequest.js.map