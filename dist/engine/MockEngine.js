"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEngine = void 0;
const msw_1 = require("msw");
const utils_1 = require("../utils");
/**
 * Core engine for generating MSW handlers from OpenAPI schemas
 *
 * This class provides functionality to create both runtime MSW handlers
 * and static TypeScript code from OpenAPI 3.0 specifications.
 *
 * @example
 * ```typescript
 * const engine = new MockEngine(openApiSchema, {
 *   baseUrl: 'https://api.example.com',
 *   errorRate: 0.05,
 *   locale: 'en'
 * });
 *
 * // Generate runtime handlers
 * const handlers = engine.generateHandlers();
 *
 * // Generate static TypeScript code
 * const code = engine.generateHandlerCode();
 * ```
 */
class MockEngine {
    /**
     * Creates a new MockEngine instance
     *
     * @param schema - The OpenAPI 3.0 schema object
     * @param config - Configuration options for mock generation
     * @param config.baseUrl - Base URL for API endpoints (default: '')
     * @param config.errorRate - Probability of error responses (0.0-1.0, default: 0.05)
     * @param config.locale - Locale for faker.js data generation (default: 'en')
     * @param config.customGenerators - Custom data generators for specific schemas
     */
    constructor(schema, config = {}) {
        this.schema = schema;
        this.config = config;
    }
    /**
     * Generates MSW handlers for runtime use
     *
     * Creates HttpHandler instances that can be used directly with MSW
     * for intercepting HTTP requests during development or testing.
     *
     * @example
     * ```typescript
     * const handlers = engine.generateHandlers();
     * const worker = setupWorker(...handlers);
     * worker.start();
     * ```
     *
     * @returns Array of MSW HttpHandler instances
     */
    generateHandlers() {
        return Object.entries(this.schema.paths).flatMap(([path, pathItem]) => Object.entries(pathItem)
            .filter(([method]) => ["get", "post", "put", "delete", "patch"].includes(method))
            .map(([method, operation]) => this.createHandler(path, method, operation))
            .filter((handler) => handler !== null));
    }
    /**
     * Generates TypeScript code for static MSW handlers
     *
     * Creates a complete TypeScript file with MSW handlers that can be
     * saved to disk and imported into projects. Includes imports and
     * exports for immediate use.
     *
     * @example
     * ```typescript
     * const code = engine.generateHandlerCode();
     * writeFileSync('handlers.ts', code);
     * ```
     *
     * @returns Complete TypeScript code as a string
     */
    generateHandlerCode() {
        const imports = [
            "import { http, type HttpHandler, HttpResponse } from 'msw';",
            "import { faker } from '@faker-js/faker';",
        ].join("\n");
        let handlerIndex = 0;
        const handlerCode = Object.entries(this.schema.paths)
            .flatMap(([path, pathItem]) => Object.entries(pathItem)
            .filter(([method]) => ["get", "post", "put", "delete", "patch"].includes(method))
            .map(([method, operation]) => {
            const pathPattern = (0, utils_1.convertPathToMswPattern)(path);
            const baseUrl = this.config.baseUrl || "";
            const url = `${baseUrl}${pathPattern}`;
            const successSchema = operation.responses["200"]
                ?.content?.["application/json"]?.schema;
            const errorSchemas = Object.entries(operation.responses)
                .filter(([status]) => status.startsWith("4") || status.startsWith("5"))
                .map(([status, response]) => ({
                status: Number.parseInt(status),
                schema: response.content?.["application/json"]?.schema,
            }));
            const idx = handlerIndex++;
            return `// Handler ${idx + 1} - ${method.toUpperCase()} ${path}\nconst handler${idx}: HttpHandler = http.${method}('${url}', () => {\n  // エラーレスポンスの生成（${this.config.errorRate || 0.05}の確率）\n  const errorSchemas = ${JSON.stringify(errorSchemas)};\n  if (errorSchemas.length > 0 && Math.random() < ${this.config.errorRate || 0.05}) {\n    const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];\n    return HttpResponse.json({\n      statusCode: error.status,\n      message: 'Error response'\n    }, { status: error.status });\n  }\n\n  // 成功レスポンスの生成\n  const mockData = ${successSchema ? "generateMockData()" : "{}"};\n  return HttpResponse.json(mockData);\n});`;
        }))
            .join("\n\n");
        const exportCode = `export const handlers: HttpHandler[] = [\n  ${[...Array(handlerIndex).keys()].map((i) => `handler${i}`).join(",\n  ")}\n];`;
        return `${imports}\n\n${handlerCode}\n\n${exportCode}`;
    }
    /**
     * Creates a single MSW handler for a specific path and method
     *
     * @param path - API path from OpenAPI schema
     * @param method - HTTP method (get, post, put, delete, patch)
     * @param operation - OpenAPI operation object
     * @returns MSW HttpHandler or null if method is not supported
     * @private
     */
    createHandler(path, method, operation) {
        const pathPattern = (0, utils_1.convertPathToMswPattern)(path);
        const baseUrl = this.config.baseUrl || "";
        const url = `${baseUrl}${pathPattern}`;
        const successSchema = operation.responses["200"]?.content?.["application/json"]?.schema;
        const errorSchemas = Object.entries(operation.responses)
            .filter(([status]) => status.startsWith("4") || status.startsWith("5"))
            .map(([status, response]) => ({
            status: Number.parseInt(status),
            schema: response.content?.["application/json"]?.schema,
        }));
        const handler = () => {
            const errorResponse = this.createErrorResponse(errorSchemas);
            if (errorResponse) {
                return errorResponse;
            }
            return this.createSuccessResponse(successSchema);
        };
        switch (method) {
            case "get":
                return msw_1.http.get(url, handler);
            case "post":
                return msw_1.http.post(url, handler);
            case "put":
                return msw_1.http.put(url, handler);
            case "delete":
                return msw_1.http.delete(url, handler);
            case "patch":
                return msw_1.http.patch(url, handler);
            default:
                return null;
        }
    }
    /**
     * Creates an error response based on configured error rate
     *
     * @param errorSchemas - Array of error schemas from OpenAPI operation
     * @returns HttpResponse with error data or null if no error should be returned
     * @private
     */
    createErrorResponse(errorSchemas) {
        if (errorSchemas.length === 0 ||
            Math.random() >= (this.config.errorRate || 0.05)) {
            return null;
        }
        const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];
        const mockData = error.schema
            ? (0, utils_1.generateMockData)(error.schema, this.schema, this.config.locale)
            : (0, utils_1.generateErrorResponse)(error.status);
        return msw_1.HttpResponse.json(mockData, { status: error.status });
    }
    /**
     * Creates a success response with mock data
     *
     * @param schema - OpenAPI schema for the response
     * @returns HttpResponse with generated mock data
     * @private
     */
    createSuccessResponse(schema) {
        if (!schema) {
            return msw_1.HttpResponse.json({});
        }
        const mockData = (0, utils_1.generateMockData)(schema, this.schema, this.config.locale);
        if (Array.isArray(mockData)) {
            const response = { items: mockData };
            return msw_1.HttpResponse.json(response);
        }
        if (typeof mockData === "object" && mockData !== null) {
            if ("items" in mockData && Array.isArray(mockData.items)) {
                return msw_1.HttpResponse.json(mockData);
            }
        }
        return msw_1.HttpResponse.json(mockData);
    }
}
exports.MockEngine = MockEngine;
//# sourceMappingURL=MockEngine.js.map