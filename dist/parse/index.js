"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJsonSchema = exports.loadYamlSchema = exports.loadOpenApiSchema = void 0;
const yamlParser_1 = require("./yamlParser");
const jsonParser_1 = require("./jsonParser");
/**
 * OpenAPIスキーマを読み込む統一インターフェース
 * YAMLファイルとJSONファイルの両方に対応
 */
const loadOpenApiSchema = (filePath) => {
    const fileExtension = getFileExtension(filePath);
    switch (fileExtension.toLowerCase()) {
        case "yaml":
        case "yml":
            return (0, yamlParser_1.loadYamlSchema)(filePath);
        case "json":
            return (0, jsonParser_1.loadJsonSchema)(filePath);
        default:
            throw new Error(`Unsupported file format: ${fileExtension}. Supported formats: yaml, yml, json`);
    }
};
exports.loadOpenApiSchema = loadOpenApiSchema;
/**
 * ファイル拡張子を取得する
 */
const getFileExtension = (filePath) => {
    const lastDotIndex = filePath.lastIndexOf(".");
    if (lastDotIndex === -1) {
        throw new Error(`No file extension found in path: ${filePath}`);
    }
    return filePath.substring(lastDotIndex + 1);
};
var yamlParser_2 = require("./yamlParser");
Object.defineProperty(exports, "loadYamlSchema", { enumerable: true, get: function () { return yamlParser_2.loadYamlSchema; } });
var jsonParser_2 = require("./jsonParser");
Object.defineProperty(exports, "loadJsonSchema", { enumerable: true, get: function () { return jsonParser_2.loadJsonSchema; } });
//# sourceMappingURL=index.js.map