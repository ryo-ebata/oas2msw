import { faker } from "@faker-js/faker";
import { ErrorSchema, type OpenApiSchema, type SchemaProperty } from "./types";

/**
 * OpenAPIスキーマの参照を解決する
 */
export const resolveRef = (
	schema: SchemaProperty,
	openApiSchema: OpenApiSchema,
): SchemaProperty => {
	if (!schema.$ref) return schema;

	const refPath = schema.$ref.replace("#/", "").split("/");
	let resolvedSchema = openApiSchema as any;

	for (const path of refPath) {
		resolvedSchema = resolvedSchema[path];
	}

	return resolvedSchema as SchemaProperty;
};

/**
 * スキーマに基づいてランダムな値を生成する
 */
export const generateRandomValue = (
	schema: SchemaProperty,
	locale: string = "en",
): unknown => {
	// ロケールを設定（デフォルトのfakerを使用）
	// 注意: 新しいバージョンのFakerではロケール設定方法が変更されている

	if (schema.enum) {
		return schema.enum[Math.floor(Math.random() * schema.enum.length)];
	}

	switch (schema.type) {
		case "string": {
			let value: string;
			if (schema.format) {
				switch (schema.format) {
					case "email":
						value = faker.internet.email();
						break;
					case "date-time":
						value = faker.date.recent().toISOString();
						break;
					case "date":
						value = faker.date.recent().toISOString().split("T")[0];
						break;
					case "uuid":
						value = faker.string.uuid();
						break;
					case "uri":
						value = faker.internet.url();
						break;
					case "ipv4":
						value = faker.internet.ipv4();
						break;
					case "ipv6":
						value = faker.internet.ipv6();
						break;
					default:
						value = faker.lorem.word();
				}
			} else {
				const length = schema.maxLength ?? schema.minLength ?? 10;
				value = faker.lorem.word().slice(0, length);
			}
			return value;
		}

		case "number":
		case "integer": {
			if (schema.description?.toLowerCase().includes("id")) {
				return faker.number.int({ min: 1, max: 1000 });
			}
			const min = schema.minimum ?? 0;
			const max = schema.maximum ?? 100;
			return faker.number.int({ min, max });
		}

		case "boolean": {
			return faker.datatype.boolean();
		}

		case "array": {
			if (schema.items) {
				const length = faker.number.int({ min: 1, max: 5 });
				return Array.from({ length }, () =>
					generateRandomValue(schema.items as SchemaProperty, locale),
				);
			}
			return [];
		}

		case "object": {
			if (schema.properties) {
				return Object.entries(schema.properties).reduce(
					(acc, [key, value]) => {
						acc[key] = generateRandomValue(value, locale);
						return acc;
					},
					{} as Record<string, unknown>,
				);
			}
			return {};
		}

		default:
			return null;
	}
};

/**
 * スキーマに基づいてモックデータを生成する
 */
export const generateMockData = (
	schema: SchemaProperty | undefined,
	openApiSchema: OpenApiSchema,
	locale: string = "en",
): Record<string, unknown> | unknown[] => {
	if (!schema) {
		return {};
	}

	const resolvedSchema = resolveRef(schema, openApiSchema);

	if (resolvedSchema.type === "object" && resolvedSchema.properties) {
		return Object.entries(resolvedSchema.properties).reduce(
			(acc, [key, value]) => {
				const resolvedValue = resolveRef(value, openApiSchema);
				if (resolvedValue.type === "array" && resolvedValue.items) {
					if (resolvedValue.example) {
						acc[key] = resolvedValue.example;
					} else {
						const itemsSchema = resolveRef(resolvedValue.items, openApiSchema);
						const length = faker.number.int({ min: 1, max: 5 });
						acc[key] = Array.from({ length }, () =>
							["string", "number", "integer", "boolean"].includes(
								itemsSchema.type || "",
							)
								? generateRandomValue(itemsSchema, locale)
								: generateMockData(itemsSchema, openApiSchema, locale),
						);
					}
				} else if (key === "id") {
					acc[key] = generateRandomValue(resolvedValue, locale);
				} else {
					acc[key] =
						resolvedValue.example ?? generateRandomValue(resolvedValue, locale);
				}
				return acc;
			},
			{} as Record<string, unknown>,
		);
	}

	if (resolvedSchema.type === "array" && resolvedSchema.items) {
		if (resolvedSchema.example) {
			return resolvedSchema.example as unknown[];
		}
		const resolvedItems = resolveRef(resolvedSchema.items, openApiSchema);
		const length = faker.number.int({ min: 1, max: 5 });
		if (
			resolvedItems.type === "object" &&
			resolvedItems.properties &&
			"id" in resolvedItems.properties
		) {
			const usedIds = new Set<number>();
			return Array.from({ length }, () => {
				let item: Record<string, unknown>;
				let id: number;
				do {
					item = generateMockData(
						resolvedItems,
						openApiSchema,
						locale,
					) as Record<string, unknown>;
					id = item.id as number;
				} while (usedIds.has(id));
				usedIds.add(id);
				return item;
			});
		}
		return Array.from({ length }, () =>
			["string", "number", "integer", "boolean"].includes(
				resolvedItems.type || "",
			)
				? generateRandomValue(resolvedItems, locale)
				: generateMockData(resolvedItems, openApiSchema, locale),
		);
	}

	const randomValue = generateRandomValue(resolvedSchema, locale);
	if (Array.isArray(randomValue)) {
		return randomValue;
	}
	if (typeof randomValue === "object" && randomValue !== null) {
		return randomValue as Record<string, unknown>;
	}
	return { value: randomValue };
};

/**
 * エラーレスポンスを生成する
 */
export const generateErrorResponse = (
	statusCode: number,
): Record<string, unknown> => ({
	statusCode,
	message:
		{
			400: "Bad Request",
			401: "Unauthorized",
			403: "Forbidden",
			404: "Not Found",
			500: "Internal Server Error",
		}[statusCode] || "Unknown Error",
});

/**
 * パスパラメータをMSWのパスパラメータ形式に変換する
 */
export const convertPathToMswPattern = (path: string): string => {
	return path.replace(/\{([^}]+)\}/g, ":$1");
};
