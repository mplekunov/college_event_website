"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
class Encryptor {
    async encrypt(data) {
        // Arbitrarily uses 10 rounds to generate the salt for the hash.
        return bcrypt_1.default.hash(data, 10);
    }
    async compare(data, encryptedData) {
        return bcrypt_1.default.compare(data, encryptedData);
    }
}
exports.default = Encryptor;
//# sourceMappingURL=Encryptor.js.map