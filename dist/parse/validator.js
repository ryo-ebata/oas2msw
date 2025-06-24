"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOpenApiSchema = void 0;
/**
 * OpenAPIスキーマの基本的な検証を行う
 */
const validateOpenApiSchema = (schema) => {
    if (!schema || typeof schema !== "object") {
        throw new Error("Invalid schema: schema must be an object");
    }
    if (!schema.openapi) {
        throw new Error("Invalid OpenAPI schema: 'openapi' field is required");
    }
    if (!schema.info) {
        throw new Error("Invalid OpenAPI schema: 'info' field is required");
    }
    if (!schema.paths) {
        throw new Error("Invalid OpenAPI schema: 'paths' field is required");
    }
};
exports.validateOpenApiSchema = validateOpenApiSchema;
//# sourceMappingURL=validator.js.map