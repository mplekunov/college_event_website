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
const Schema_1 = __importDefault(require("../../Schema"));
const class_validator_1 = require("class-validator");
class BaseUniversitySchema extends Schema_1.default {
    name;
    description;
    location;
    numStudents;
    constructor(name, description, location, numStudents) {
        super();
        this.name = name;
        this.description = description;
        this.location = location;
        this.numStudents = numStudents;
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseUniversitySchema.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseUniversitySchema.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)()
], BaseUniversitySchema.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsInt)()
], BaseUniversitySchema.prototype, "numStudents", void 0);
exports.default = BaseUniversitySchema;
//# sourceMappingURL=BaseUniversitySchema.js.map