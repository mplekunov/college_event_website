"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JsonWebTokenError_1 = __importDefault(require("../exceptions/JsonWebTokenError"));
class TokenCreator {
    privateKey;
    constructor(privateKey) {
        this.privateKey = privateKey;
    }
    getException(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
    sign(obj, expiresInSeconds) {
        return jsonwebtoken_1.default.sign(obj, this.privateKey, {
            expiresIn: expiresInSeconds
        });
    }
    verify(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.privateKey);
        }
        catch (error) {
            throw new JsonWebTokenError_1.default(this.getException(error));
        }
    }
}
exports.default = TokenCreator;
//# sourceMappingURL=TokenCreator.js.map