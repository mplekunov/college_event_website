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
class BaseEventSchema extends Schema_1.default {
    name;
    hostID;
    hostType;
    category;
    description;
    date;
    location;
    email;
    phone;
    constructor(name, hostID, hostType, category, description, date, location, email, phone) {
        super();
        this.name = name;
        this.hostID = hostID;
        this.hostType = hostType;
        this.category = category;
        this.description = description;
        this.date = date;
        this.location = location;
        this.email = email;
        this.phone = phone;
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseEventSchema.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseEventSchema.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseEventSchema.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsInt)()
], BaseEventSchema.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)()
], BaseEventSchema.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsEmail)()
], BaseEventSchema.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], BaseEventSchema.prototype, "phone", void 0);
exports.default = BaseEventSchema;
//# sourceMappingURL=BaseEventSchema.js.map