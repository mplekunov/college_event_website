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
class BaseUniversityShema extends Schema_1.default {
    universityID;
    name;
    description;
    location;
    numStudents;
    constructor(universityID, name, description, location, numStudents) {
        super();
        this.universityID = universityID;
        this.name = name;
        this.description = description;
        this.location = location;
        this.numStudents = numStudents;
    }
}
__decorate([
    (0, class_validator_1.IsString)()
], BaseUniversityShema.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], BaseUniversityShema.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)()
], BaseUniversityShema.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsInt)()
], BaseUniversityShema.prototype, "numStudents", void 0);
exports.default = BaseUniversityShema;
//# sourceMappingURL=BaseUniversitySchema.js.map