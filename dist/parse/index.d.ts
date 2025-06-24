import type { OpenApiSchema } from "../types";
/**
 * OpenAPIスキーマを読み込む統一インターフェース
 * YAMLファイルとJSONファイルの両方に対応
 */
export declare const loadOpenApiSchema: (filePath: string) => OpenApiSchema;
export { loadYamlSchema } from "./yamlParser";
export { loadJsonSchema } from "./jsonParser";
//# sourceMappingURL=index.d.ts.map