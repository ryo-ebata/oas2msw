/**
 * OpenAPIスキーマの基本的な検証を行う
 */
export const validateOpenApiSchema = (schema: any): void => {
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
