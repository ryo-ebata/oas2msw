import { type HttpHandler, HttpResponse, http } from "msw";
import type {
	ErrorSchema,
	MswHandlerConfig,
	OpenApiSchema,
	Operation,
} from "../types";
import {
	convertPathToMswPattern,
	generateErrorResponse,
	generateMockData,
} from "../utils";

export class MockEngine {
	private schema: OpenApiSchema;
	private config: MswHandlerConfig;

	constructor(schema: OpenApiSchema, config: MswHandlerConfig = {}) {
		this.schema = schema;
		this.config = config;
	}

	public generateHandlers(): HttpHandler[] {
		return Object.entries(this.schema.paths).flatMap(([path, pathItem]) =>
			Object.entries(pathItem)
				.filter(([method]) =>
					["get", "post", "put", "delete", "patch"].includes(method),
				)
				.map(([method, operation]) =>
					this.createHandler(path, method, operation as Operation),
				)
				.filter((handler): handler is HttpHandler => handler !== null),
		);
	}

	public generateHandlerCode(): string {
		const imports = [
			"import { http, type HttpHandler, HttpResponse } from 'msw';",
			"import { faker } from '@faker-js/faker';",
		].join("\n");

		let handlerIndex = 0;
		const handlerCode = Object.entries(this.schema.paths)
			.flatMap(([path, pathItem]) =>
				Object.entries(pathItem)
					.filter(([method]) =>
						["get", "post", "put", "delete", "patch"].includes(method),
					)
					.map(([method, operation]) => {
						const pathPattern = convertPathToMswPattern(path);
						const baseUrl = this.config.baseUrl || "";
						const url = `${baseUrl}${pathPattern}`;
						const successSchema = (operation as Operation).responses["200"]
							?.content?.["application/json"]?.schema;
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
						const idx = handlerIndex++;
						return `// Handler ${idx + 1} - ${method.toUpperCase()} ${path}\nconst handler${idx}: HttpHandler = http.${method}('${url}', () => {\n  // エラーレスポンスの生成（${this.config.errorRate || 0.05}の確率）\n  const errorSchemas = ${JSON.stringify(errorSchemas)};\n  if (errorSchemas.length > 0 && Math.random() < ${this.config.errorRate || 0.05}) {\n    const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];\n    return HttpResponse.json({\n      statusCode: error.status,\n      message: 'Error response'\n    }, { status: error.status });\n  }\n\n  // 成功レスポンスの生成\n  const mockData = ${successSchema ? "generateMockData()" : "{}"};\n  return HttpResponse.json(mockData);\n});`;
					}),
			)
			.join("\n\n");

		const exportCode = `export const handlers: HttpHandler[] = [\n  ${[...Array(handlerIndex).keys()].map((i) => `handler${i}`).join(",\n  ")}\n];`;

		return `${imports}\n\n${handlerCode}\n\n${exportCode}`;
	}

	private createHandler(
		path: string,
		method: string,
		operation: Operation,
	): HttpHandler | null {
		const pathPattern = convertPathToMswPattern(path);
		const baseUrl = this.config.baseUrl || "";
		const url = `${baseUrl}${pathPattern}`;
		const successSchema =
			operation.responses["200"]?.content?.["application/json"]?.schema;
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
	}

	private createErrorResponse(
		errorSchemas: ErrorSchema[],
	): HttpResponse<any> | null {
		if (
			errorSchemas.length === 0 ||
			Math.random() >= (this.config.errorRate || 0.05)
		) {
			return null;
		}
		const error = errorSchemas[Math.floor(Math.random() * errorSchemas.length)];
		const mockData = error.schema
			? generateMockData(error.schema, this.schema, this.config.locale)
			: generateErrorResponse(error.status);
		return HttpResponse.json(mockData, { status: error.status });
	}

	private createSuccessResponse(schema: any): HttpResponse<any> {
		if (!schema) {
			return HttpResponse.json({});
		}
		const mockData = generateMockData(schema, this.schema, this.config.locale);
		if (Array.isArray(mockData)) {
			const response = { items: mockData };
			return HttpResponse.json(response);
		}
		if (typeof mockData === "object" && mockData !== null) {
			if ("items" in mockData && Array.isArray((mockData as any).items)) {
				return HttpResponse.json(mockData);
			}
		}
		return HttpResponse.json(mockData);
	}
}
