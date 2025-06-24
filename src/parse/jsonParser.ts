import { readFileSync } from "fs";
import { resolve } from "path";
import type { OpenApiSchema } from "../types";
import { validateOpenApiSchema } from "./validator";

/**
 * JSONファイルからOpenAPIスキーマを読み込む
 */
export const loadJsonSchema = (filePath: string): OpenApiSchema => {
	try {
		const absolutePath = resolve(filePath);
		const fileContent = readFileSync(absolutePath, "utf8");
		const parsedSchema = JSON.parse(fileContent) as OpenApiSchema;

		// OpenAPIスキーマの基本的な検証
		validateOpenApiSchema(parsedSchema);

		return parsedSchema;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Error loading JSON schema from ${filePath}: ${message}`);
	}
};
