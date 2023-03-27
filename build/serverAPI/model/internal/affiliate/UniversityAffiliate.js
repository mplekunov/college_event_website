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
class BaseUniversityAffiliateSchema extends Schema_1.default {
    organizationName;
    affiliationType;
    constructor(organization, affiliationType) {
        super();
        this.organizationName = organization;
        this.affiliationType = affiliationType;
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseUniversityAffiliateSchema.prototype, "organizationName", void 0);
exports.default = BaseUniversityAffiliateSchema;
//# sourceMappingURL=UniversityAffiliate.js.map