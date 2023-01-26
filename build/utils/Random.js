"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Random {
    /**
     *  Generates random number in the provided range.
     *
     * @param min number in the range
     * @param max number in the range
     * @returns random number in the [min, max] range.
     */
    static getRandomIntInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
exports.default = Random;
//# sourceMappingURL=Random.js.map