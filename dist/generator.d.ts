import { type HttpHandler } from "msw";
import { OpenApiSchema, MswHandlerConfig } from "./types";
/**
 * OpenAPIスキーマからMSWハンドラーを生成する
 */
export declare const generateHandlers: (
	openApiSchema: OpenApiSchema,
	config?: MswHandlerConfig,
) => HttpHandler[];
/**
 * ハンドラーをTypeScriptコードとして出力する
 */
export declare const generateHandlerCode: (
	openApiSchema: OpenApiSchema,
	config?: MswHandlerConfig,
) => string;
//# sourceMappingURL=generator.d.ts.map
