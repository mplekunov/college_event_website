"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomException_1 = __importDefault(require("./CustomException"));
class JsonWebTokenError extends CustomException_1.default {
    constructor(message, name) {
        super(message, name);
    }
}
exports.default = JsonWebTokenError;
//# sourceMappingURL=JsonWebTokenError.js.map