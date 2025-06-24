import { type HttpHandler, HttpResponse, http } from "msw";
import type {
	ErrorSchema,
	MswHandlerConfig,
	OpenApiSchema,
	Operation,
} from "./types";
import {
	convertPathToMswPattern,
	generateErrorResponse,
	generateMockData,
} from "./utils";

/**
 * エラーレスポンスを作成する
 */
const createErrorResponse = (
	errorSchemas: ErrorSchema[],
	openApiSchema: OpenApiSchema,
	config: MswHandlerConfig,
): HttpResponse<any> | null => {
	if (
		errorSchemas.length === 0 ||
		Math.random() >= (config.errorRate || 0.05)
	) {
		return null;
	}

	const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];
	const mockData = error.schema
		? generateMockData(error.schema, openApiSchema, config.locale)
		: generateErrorResponse(error.status);

	return HttpResponse.json(mockData, { status: error.status });
};

/**
 * 成功レスポンスを作成する
 */
const createSuccessResponse = (
	schema: any,
	openApiSchema: OpenApiSchema,
	config: MswHandlerConfig,
): HttpResponse<any> => {
	if (!schema) {
		return HttpResponse.json({});
	}

	const mockData = generateMockData(schema, openApiSchema, config.locale);

	if (Array.isArray(mockData)) {
		const response = { items: mockData };
		return HttpResponse.json(response);
	}

	if (typeof mockData === "object" && mockData !== null) {
		if ("items" in mockData && Array.isArray(mockData.items)) {
			return HttpResponse.json(mockData);
		}
	}

	return HttpResponse.json(mockData);
};

/**
 * 単一のハンドラーを作成する
 */
const createHandler = (
	path: string,
	method: string,
	operation: Operation,
	openApiSchema: OpenApiSchema,
	config: MswHandlerConfig,
): HttpHandler | null => {
	const pathPattern = convertPathToMswPattern(path);
	const baseUrl = config.baseUrl || "";
	const url = `${baseUrl}${pathPattern}`;

	// 成功時のスキーマを取得
	const successSchema =
		operation.responses["200"]?.content?.["application/json"]?.schema;

	// エラー時のスキーマを取得
	const errorSchemas = Object.entries(operation.responses)
		.filter(([status]) => status.startsWith("4") || status.startsWith("5"))
		.map(([status, response]) => ({
			status: Number.parseInt(status),
			schema: response.content?.["application/json"]?.schema,
		}));

	const handler = () => {
		const errorResponse = createErrorResponse(
			errorSchemas,
			openApiSchema,
			config,
		);
		if (errorResponse) {
			return errorResponse;
		}
		return createSuccessResponse(successSchema, openApiSchema, config);
	};

	switch (method) {
		case "get":
			return http.get(url, handler);
		case "post":
			return http.post(url, handler);
		case "put":
			return http.put(url, handler);
		case "delete":
			return http.delete(url, handler);
		case "patch":
			return http.patch(url, handler);
		default:
			return null;
	}
};

/**
 * OpenAPIスキーマからMSWハンドラーを生成する
 */
export const generateHandlers = (
	openApiSchema: OpenApiSchema,
	config: MswHandlerConfig = {},
): HttpHandler[] => {
	return Object.entries(openApiSchema.paths).flatMap(([path, pathItem]) =>
		Object.entries(pathItem)
			.filter(([method]) =>
				["get", "post", "put", "delete", "patch"].includes(method),
			)
			.map(([method, operation]) =>
				createHandler(
					path,
					method,
					operation as Operation,
					openApiSchema,
					config,
				),
			)
			.filter((handler): handler is HttpHandler => handler !== null),
	);
};

/**
 * ハンドラーをTypeScriptコードとして出力する
 */
export const generateHandlerCode = (
	openApiSchema: OpenApiSchema,
	config: MswHandlerConfig = {},
): string => {
	const imports = [
		"import { http, type HttpHandler, HttpResponse } from 'msw';",
		"import { faker } from '@faker-js/faker';",
	].join("\n");

	// ハンドラーの実装を直接生成
	const handlerCode = Object.entries(openApiSchema.paths)
		.flatMap(([path, pathItem]) =>
			Object.entries(pathItem)
				.filter(([method]) =>
					["get", "post", "put", "delete", "patch"].includes(method),
				)
				.map(([method, operation], index) => {
					const pathPattern = convertPathToMswPattern(path);
					const baseUrl = config.baseUrl || "";
					const url = `${baseUrl}${pathPattern}`;

					// 成功時のスキーマを取得
					const successSchema = (operation as Operation).responses["200"]
						?.content?.["application/json"]?.schema;

					// エラー時のスキーマを取得
					const errorSchemas = Object.entries(
						(operation as Operation).responses,
					)
						.filter(
							([status]) => status.startsWith("4") || status.startsWith("5"),
						)
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
				}),
		)
		.join("\n\n");

	const exportCode = `export const handlers: HttpHandler[] = [
    ${Object.entries(openApiSchema.paths)
			.flatMap(([path, pathItem]) =>
				Object.entries(pathItem)
					.filter(([method]) =>
						["get", "post", "put", "delete", "patch"].includes(method),
					)
					.map((_, index) => `handler${index}`),
			)
			.join(",\n    ")}
];`;

	return `${imports}

${handlerCode}

${exportCode}`;
};
