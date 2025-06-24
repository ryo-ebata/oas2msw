import type { OpenApiSchema, SchemaProperty } from "./types";
/**
 * OpenAPIスキーマの参照を解決する
 */
export declare const resolveRef: (schema: SchemaProperty, openApiSchema: OpenApiSchema) => SchemaProperty;
/**
 * スキーマに基づいてランダムな値を生成する
 */
export declare const generateRandomValue: (schema: SchemaProperty, locale?: string) => unknown;
/**
 * スキーマに基づいてモックデータを生成する
 */
export declare const generateMockData: (schema: SchemaProperty | undefined, openApiSchema: OpenApiSchema, locale?: string) => Record<string, unknown> | unknown[];
/**
 * エラーレスポンスを生成する
 */
export declare const generateErrorResponse: (statusCode: number) => Record<string, unknown>;
/**
 * パスパラメータをMSWのパスパラメータ形式に変換する
 */
export declare const convertPathToMswPattern: (path: string) => string;
//# sourceMappingURL=utils.d.ts.map