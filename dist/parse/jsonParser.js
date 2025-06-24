"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJsonSchema = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const validator_1 = require("./validator");
/**
 * JSONファイルからOpenAPIスキーマを読み込む
 */
const loadJsonSchema = (filePath) => {
    try {
        const absolutePath = (0, path_1.resolve)(filePath);
        const fileContent = (0, fs_1.readFileSync)(absolutePath, "utf8");
        const parsedSchema = JSON.parse(fileContent);
        // OpenAPIスキーマの基本的な検証
        (0, validator_1.validateOpenApiSchema)(parsedSchema);
        return parsedSchema;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error loading JSON schema from ${filePath}: ${error.message}`);
        }
        throw new Error(`Unknown error loading JSON schema from ${filePath}`);
    }
};
exports.loadJsonSchema = loadJsonSchema;
//# sourceMappingURL=jsonParser.js.map