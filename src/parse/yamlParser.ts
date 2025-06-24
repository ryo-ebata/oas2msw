import { readFileSync } from "fs";
import { load } from "js-yaml";
import { resolve } from "path";
import type { OpenApiSchema } from "../types";
import { validateOpenApiSchema } from "./validator";

/**
 * YAMLファイルからOpenAPIスキーマを読み込む
 */
export const loadYamlSchema = (filePath: string): OpenApiSchema => {
	try {
		const absolutePath = resolve(filePath);
		const fileContent = readFileSync(absolutePath, "utf8");
		const parsedSchema = load(fileContent) as OpenApiSchema;

		// OpenAPIスキーマの基本的な検証
		validateOpenApiSchema(parsedSchema);

		return parsedSchema;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(
				`Error loading YAML schema from ${filePath}: ${error.message}`,
			);
		}
		throw new Error(`Unknown error loading YAML schema from ${filePath}`);
	}
};
