"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
class Schema {
    async validate() {
        let validationError = (0, class_validator_1.validate)(this);
        const errors = await validationError;
        let logs = [];
        if (errors.length > 0) {
            errors.forEach(error => {
                if (error.constraints !== undefined) {
                    logs.push(error.constraints);
                }
                if (error.children !== undefined) {
                    error.children.forEach(child => {
                        if (child.constraints !== undefined) {
                            logs.push(child.constraints);
                        }
                    });
                }
            });
        }
        return await Promise.resolve(logs);
    }
}
exports.default = Schema;
//# sourceMappingURL=Schema.js.map