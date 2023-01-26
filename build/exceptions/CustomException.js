"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomException extends Error {
    constructor(message, name) {
        super();
        if (name !== undefined) {
            this.name = name;
        }
        if (message !== undefined) {
            this.message = message;
        }
    }
}
exports.default = CustomException;
//# sourceMappingURL=CustomException.js.map