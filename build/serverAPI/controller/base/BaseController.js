"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseCodes_1 = require("../../../utils/ResponseCodes");
class BaseController {
    getException(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
    async verifySchema(object, res) {
        let logs = await object.validate();
        if (logs.length > 0) {
            return Promise.reject(this.send(ResponseCodes_1.ResponseCodes.BAD_REQUEST, res, logs));
        }
        return object;
    }
    send(statusCode, res, message) {
        return res.status(statusCode)
            .json(message);
    }
    isStringUndefinedOrEmpty(data) {
        return data === undefined || data.length === 0;
    }
    convertResponse(collection) {
        return Array.from([["unorganized", collection]]);
    }
}
exports.default = BaseController;
//# sourceMappingURL=BaseController.js.map