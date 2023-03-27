"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(require("../../Schema"));
class RSOSchema extends Schema_1.default {
    members;
    rsoID;
    name;
    description;
    constructor(name, description, rsoID, members) {
        super();
        this.name = name;
        this.description = description;
        this.rsoID = rsoID;
        this.members = members;
    }
}
exports.default = RSOSchema;
//# sourceMappingURL=RSOSchema.js.map