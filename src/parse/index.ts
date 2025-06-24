import type { OpenApiSchema } from "../types";
import { loadJsonSchema } from "./jsonParser";
import { loadYamlSchema } from "./yamlParser";

/**
 * OpenAPIスキーマを読み込む統一インターフェース
 * YAMLファイルとJSONファイルの両方に対応
 */
export const loadOpenApiSchema = (filePath: string): OpenApiSchema => {
	const fileExtension = getFileExtension(filePath);

	switch (fileExtension.toLowerCase()) {
		case "yaml":
		case "yml":
			return loadYamlSchema(filePath);
		case "json":
			return loadJsonSchema(filePath);
		default:
			throw new Error(
				`Unsupported file format: ${fileExtension}. Supported formats: yaml, yml, json`,
			);
	}
};

/**
 * ファイル拡張子を取得する
 */
const getFileExtension = (filePath: string): string => {
	const lastDotIndex = filePath.lastIndexOf(".");
	if (lastDotIndex === -1) {
		throw new Error(`No file extension found in path: ${filePath}`);
	}
	return filePath.substring(lastDotIndex + 1);
};

export { loadJsonSchema } from "./jsonParser";
export { loadYamlSchema } from "./yamlParser";
