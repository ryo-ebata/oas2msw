import { generateHandlerCode, generateHandlers } from "../generator";
import type { OpenApiSchema } from "../types";

const sampleOpenApiSchema: OpenApiSchema = {
	openapi: "3.0.0",
	info: {
		title: "Test API",
		version: "1.0.0",
	},
	paths: {
		"/users": {
			get: {
				responses: {
					"200": {
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										items: {
											type: "array",
											items: {
												type: "object",
												properties: {
													id: { type: "integer" },
													name: { type: "string" },
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
};

describe("Generator", () => {
	describe("generateHandlers", () => {
		it("should generate handlers from OpenAPI schema", () => {
			const handlers = generateHandlers(sampleOpenApiSchema);
			expect(handlers).toHaveLength(1);
			expect(handlers[0]).toBeDefined();
		});

		it("should generate handlers with custom config", () => {
			const handlers = generateHandlers(sampleOpenApiSchema, {
				baseUrl: "https://api.example.com",
				errorRate: 0.1,
				locale: "ja",
			});
			expect(handlers).toHaveLength(1);
		});
	});

	describe("generateHandlerCode", () => {
		it("should generate TypeScript code", () => {
			const code = generateHandlerCode(sampleOpenApiSchema);
			expect(code).toContain("import { http, type HttpHandler, HttpResponse }");
			expect(code).toContain("export const handlers");
		});

		it("should include custom base URL in generated code", () => {
			const code = generateHandlerCode(sampleOpenApiSchema, {
				baseUrl: "https://api.example.com",
			});
			expect(code).toContain("https://api.example.com");
		});
	});
});
