"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHandlerCode = exports.generateHandlers = void 0;
const msw_1 = require("msw");
const utils_1 = require("./utils");
/**
 * エラーレスポンスを作成する
 */
const createErrorResponse = (errorSchemas, openApiSchema, config) => {
    if (errorSchemas.length === 0 ||
        Math.random() >= (config.errorRate || 0.05)) {
        return null;
    }
    const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];
    const mockData = error.schema
        ? (0, utils_1.generateMockData)(error.schema, openApiSchema, config.locale)
        : (0, utils_1.generateErrorResponse)(error.status);
    return msw_1.HttpResponse.json(mockData, { status: error.status });
};
/**
 * 成功レスポンスを作成する
 */
const createSuccessResponse = (schema, openApiSchema, config) => {
    if (!schema) {
        return msw_1.HttpResponse.json({});
    }
    const mockData = (0, utils_1.generateMockData)(schema, openApiSchema, config.locale);
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
};
/**
 * 単一のハンドラーを作成する
 */
const createHandler = (path, method, operation, openApiSchema, config) => {
    const pathPattern = (0, utils_1.convertPathToMswPattern)(path);
    const baseUrl = config.baseUrl || "";
    const url = `${baseUrl}${pathPattern}`;
    // 成功時のスキーマを取得
    const successSchema = operation.responses["200"]?.content?.["application/json"]?.schema;
    // エラー時のスキーマを取得
    const errorSchemas = Object.entries(operation.responses)
        .filter(([status]) => status.startsWith("4") || status.startsWith("5"))
        .map(([status, response]) => ({
        status: Number.parseInt(status),
        schema: response.content?.["application/json"]?.schema,
    }));
    const handler = () => {
        const errorResponse = createErrorResponse(errorSchemas, openApiSchema, config);
        if (errorResponse) {
            return errorResponse;
        }
        return createSuccessResponse(successSchema, openApiSchema, config);
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
};
/**
 * OpenAPIスキーマからMSWハンドラーを生成する
 */
const generateHandlers = (openApiSchema, config = {}) => {
    return Object.entries(openApiSchema.paths).flatMap(([path, pathItem]) => Object.entries(pathItem)
        .filter(([method]) => ["get", "post", "put", "delete", "patch"].includes(method))
        .map(([method, operation]) => createHandler(path, method, operation, openApiSchema, config))
        .filter((handler) => handler !== null));
};
exports.generateHandlers = generateHandlers;
/**
 * ハンドラーをTypeScriptコードとして出力する
 */
const generateHandlerCode = (openApiSchema, config = {}) => {
    const imports = [
        "import { http, type HttpHandler, HttpResponse } from 'msw';",
        "import { faker } from '@faker-js/faker';",
    ].join("\n");
    // ハンドラーの実装を直接生成
    const handlerCode = Object.entries(openApiSchema.paths)
        .flatMap(([path, pathItem]) => Object.entries(pathItem)
        .filter(([method]) => ["get", "post", "put", "delete", "patch"].includes(method))
        .map(([method, operation], index) => {
        const pathPattern = (0, utils_1.convertPathToMswPattern)(path);
        const baseUrl = config.baseUrl || "";
        const url = `${baseUrl}${pathPattern}`;
        // 成功時のスキーマを取得
        const successSchema = operation.responses["200"]
            ?.content?.["application/json"]?.schema;
        // エラー時のスキーマを取得
        const errorSchemas = Object.entries(operation.responses)
            .filter(([status]) => status.startsWith("4") || status.startsWith("5"))
            .map(([status, response]) => ({
            status: Number.parseInt(status),
            schema: response.content?.["application/json"]?.schema,
        }));
        return `// Handler ${index + 1} - ${method.toUpperCase()} ${path}
const handler${index}: HttpHandler = http.${method}('${url}', () => {
  // エラーレスポンスの生成（${config.errorRate || 0.05}の確率）
  const errorSchemas = ${JSON.stringify(errorSchemas)};
  if (errorSchemas.length > 0 && Math.random() < ${config.errorRate || 0.05}) {
    const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];
    return HttpResponse.json({
      statusCode: error.status,
      message: 'Error response'
    }, { status: error.status });
  }

  // 成功レスポンスの生成
  const mockData = ${successSchema ? "generateMockData()" : "{}"};
  return HttpResponse.json(mockData);
});`;
    }))
        .join("\n\n");
    const exportCode = `export const handlers: HttpHandler[] = [
    ${Object.entries(openApiSchema.paths)
        .flatMap(([path, pathItem]) => Object.entries(pathItem)
        .filter(([method]) => ["get", "post", "put", "delete", "patch"].includes(method))
        .map((_, index) => `handler${index}`))
        .join(",\n    ")}
];`;
    return `${imports}

${handlerCode}

${exportCode}`;
};
exports.generateHandlerCode = generateHandlerCode;
//# sourceMappingURL=generator.js.map