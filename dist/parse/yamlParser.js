"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadYamlSchema = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const js_yaml_1 = require("js-yaml");
const validator_1 = require("./validator");
/**
 * YAMLファイルからOpenAPIスキーマを読み込む
 */
const loadYamlSchema = (filePath) => {
    try {
        const absolutePath = (0, path_1.resolve)(filePath);
        const fileContent = (0, fs_1.readFileSync)(absolutePath, "utf8");
        const parsedSchema = (0, js_yaml_1.load)(fileContent);
        // OpenAPIスキーマの基本的な検証
        (0, validator_1.validateOpenApiSchema)(parsedSchema);
        return parsedSchema;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error loading YAML schema from ${filePath}: ${error.message}`);
        }
        throw new Error(`Unknown error loading YAML schema from ${filePath}`);
    }
};
exports.loadYamlSchema = loadYamlSchema;
//# sourceMappingURL=yamlParser.js.map