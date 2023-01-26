"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Token {
    token;
    generationDate;
    lifespanInSeconds;
    expirationDate;
    constructor(token, generationDate, lifespanInSeconds, expirationDate) {
        this.token = token;
        this.generationDate = generationDate;
        this.lifespanInSeconds = lifespanInSeconds;
        this.expirationDate = expirationDate;
    }
}
exports.default = Token;
//# sourceMappingURL=Token.js.map