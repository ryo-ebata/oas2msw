import { resolve } from "path";
import { loadOpenApiSchema } from "../parse";

describe("parse", () => {
	describe("loadOpenApiSchema", () => {
		it("should load JSON schema correctly", () => {
			const jsonPath = resolve(__dirname, "../../samples/sample-openapi.json");
			const schema = loadOpenApiSchema(jsonPath);

			expect(schema.openapi).toBe("3.0.0");
			expect(schema.info.title).toBe("Sample API");
			expect(schema.info.version).toBe("1.0.0");
			expect(schema.paths).toBeDefined();
			expect(schema.components?.schemas).toBeDefined();
		});

		it("should load YAML schema correctly", () => {
			const yamlPath = resolve(__dirname, "../../samples/sample-openapi.yaml");
			const schema = loadOpenApiSchema(yamlPath);

			expect(schema.openapi).toBe("3.0.0");
			expect(schema.info.title).toBe("Sample API");
			expect(schema.info.version).toBe("1.0.0");
			expect(schema.paths).toBeDefined();
			expect(schema.components?.schemas).toBeDefined();
		});

		it("should throw error for unsupported file format", () => {
			expect(() => {
				loadOpenApiSchema("test.txt");
			}).toThrow(
				"Unsupported file format: txt. Supported formats: yaml, yml, json",
			);
		});

		it("should throw error for file without extension", () => {
			expect(() => {
				loadOpenApiSchema("test");
			}).toThrow("No file extension found in path: test");
		});

		it("should throw error for non-existent file", () => {
			expect(() => {
				loadOpenApiSchema("non-existent.json");
			}).toThrow(/Error loading JSON schema from non-existent\.json/);
		});

		it("should throw error for invalid JSON", () => {
			// 一時的な無効なJSONファイルを作成
			const fs = require("fs");
			const tempFile = resolve(__dirname, "temp-invalid.json");
			fs.writeFileSync(tempFile, "{ invalid json }");

			expect(() => {
				loadOpenApiSchema(tempFile);
			}).toThrow(/Error loading JSON schema from/);

			// 一時ファイルを削除
			fs.unlinkSync(tempFile);
		});

		it("should throw error for invalid YAML", () => {
			// 一時的な無効なYAMLファイルを作成
			const fs = require("fs");
			const tempFile = resolve(__dirname, "temp-invalid.yaml");
			fs.writeFileSync(tempFile, "invalid: yaml: content: [");

			expect(() => {
				loadOpenApiSchema(tempFile);
			}).toThrow(/Error loading YAML schema from/);

			// 一時ファイルを削除
			fs.unlinkSync(tempFile);
		});

		it("should throw error for invalid OpenAPI schema", () => {
			// 一時的な無効なスキーマファイルを作成
			const fs = require("fs");
			const tempFile = resolve(__dirname, "temp-invalid-schema.json");
			fs.writeFileSync(tempFile, JSON.stringify({ invalid: "schema" }));

			expect(() => {
				loadOpenApiSchema(tempFile);
			}).toThrow("Invalid OpenAPI schema: 'openapi' field is required");

			// 一時ファイルを削除
			fs.unlinkSync(tempFile);
		});
	});
});
