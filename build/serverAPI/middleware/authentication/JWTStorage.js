"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JWTStorage {
    static instance;
    map;
    constructor() {
        this.map = new Map();
    }
    /**
     * Retrieves current instance of the JWTStorage if such exists.
     *
     * @returns JWTStorage object or undefined.
     */
    static getInstance() {
        if (JWTStorage.instance === undefined) {
            JWTStorage.instance = new JWTStorage();
        }
        return JWTStorage.instance;
    }
    hasJWT(key) {
        return this.map.has(key);
    }
    getJWT(key) {
        return this.map.get(key);
    }
    deleteJWT(key) {
        return this.map.delete(key);
    }
    addJWT(key, token) {
        this.map.set(key, token);
    }
}
exports.default = JWTStorage;
//# sourceMappingURL=JWTStorage.js.map