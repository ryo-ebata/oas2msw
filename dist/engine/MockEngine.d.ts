import { type HttpHandler } from "msw";
import type { MswHandlerConfig, OpenApiSchema } from "../types";
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
export declare class MockEngine {
    private schema;
    private config;
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
    constructor(schema: OpenApiSchema, config?: MswHandlerConfig);
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
    generateHandlers(): HttpHandler[];
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
    generateHandlerCode(): string;
    /**
     * Creates a single MSW handler for a specific path and method
     *
     * @param path - API path from OpenAPI schema
     * @param method - HTTP method (get, post, put, delete, patch)
     * @param operation - OpenAPI operation object
     * @returns MSW HttpHandler or null if method is not supported
     * @private
     */
    private createHandler;
    /**
     * Creates an error response based on configured error rate
     *
     * @param errorSchemas - Array of error schemas from OpenAPI operation
     * @returns HttpResponse with error data or null if no error should be returned
     * @private
     */
    private createErrorResponse;
    /**
     * Creates a success response with mock data
     *
     * @param schema - OpenAPI schema for the response
     * @returns HttpResponse with generated mock data
     * @private
     */
    private createSuccessResponse;
}
//# sourceMappingURL=MockEngine.d.ts.map