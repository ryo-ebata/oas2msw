"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPathToMswPattern = exports.generateErrorResponse = exports.generateMockData = exports.generateRandomValue = exports.resolveRef = void 0;
const faker_1 = require("@faker-js/faker");
/**
 * OpenAPIスキーマの参照を解決する
 */
const resolveRef = (schema, openApiSchema) => {
    if (!schema.$ref)
        return schema;
    const refPath = schema.$ref.replace("#/", "").split("/");
    let resolvedSchema = openApiSchema;
    for (const path of refPath) {
        resolvedSchema = resolvedSchema[path];
    }
    return resolvedSchema;
};
exports.resolveRef = resolveRef;
/**
 * スキーマに基づいてランダムな値を生成する
 */
const generateRandomValue = (schema, locale = "en") => {
    // ロケールを設定（デフォルトのfakerを使用）
    // 注意: 新しいバージョンのFakerではロケール設定方法が変更されている
    if (schema.enum) {
        return schema.enum[Math.floor(Math.random() * schema.enum.length)];
    }
    switch (schema.type) {
        case "string": {
            let value;
            if (schema.format) {
                switch (schema.format) {
                    case "email":
                        value = faker_1.faker.internet.email();
                        break;
                    case "date-time":
                        value = faker_1.faker.date.recent().toISOString();
                        break;
                    case "date":
                        value = faker_1.faker.date.recent().toISOString().split("T")[0];
                        break;
                    case "uuid":
                        value = faker_1.faker.string.uuid();
                        break;
                    case "uri":
                        value = faker_1.faker.internet.url();
                        break;
                    case "ipv4":
                        value = faker_1.faker.internet.ipv4();
                        break;
                    case "ipv6":
                        value = faker_1.faker.internet.ipv6();
                        break;
                    default:
                        value = faker_1.faker.lorem.word();
                }
            }
            else {
                const length = schema.maxLength ?? schema.minLength ?? 10;
                value = faker_1.faker.lorem.word().slice(0, length);
            }
            return value;
        }
        case "number":
        case "integer": {
            if (schema.description?.toLowerCase().includes("id")) {
                return faker_1.faker.number.int({ min: 1, max: 1000 });
            }
            const min = schema.minimum ?? 0;
            const max = schema.maximum ?? 100;
            return faker_1.faker.number.int({ min, max });
        }
        case "boolean": {
            return faker_1.faker.datatype.boolean();
        }
        case "array": {
            if (schema.items) {
                const length = faker_1.faker.number.int({ min: 1, max: 5 });
                return Array.from({ length }, () => (0, exports.generateRandomValue)(schema.items, locale));
            }
            return [];
        }
        case "object": {
            if (schema.properties) {
                return Object.entries(schema.properties).reduce((acc, [key, value]) => {
                    acc[key] = (0, exports.generateRandomValue)(value, locale);
                    return acc;
                }, {});
            }
            return {};
        }
        default:
            return null;
    }
};
exports.generateRandomValue = generateRandomValue;
/**
 * スキーマに基づいてモックデータを生成する
 */
const generateMockData = (schema, openApiSchema, locale = "en") => {
    if (!schema) {
        return {};
    }
    const resolvedSchema = (0, exports.resolveRef)(schema, openApiSchema);
    if (resolvedSchema.type === "object" && resolvedSchema.properties) {
        return Object.entries(resolvedSchema.properties).reduce((acc, [key, value]) => {
            const resolvedValue = (0, exports.resolveRef)(value, openApiSchema);
            if (resolvedValue.type === "array" && resolvedValue.items) {
                if (resolvedValue.example) {
                    acc[key] = resolvedValue.example;
                }
                else {
                    const itemsSchema = (0, exports.resolveRef)(resolvedValue.items, openApiSchema);
                    const length = faker_1.faker.number.int({ min: 1, max: 5 });
                    acc[key] = Array.from({ length }, () => ["string", "number", "integer", "boolean"].includes(itemsSchema.type || "")
                        ? (0, exports.generateRandomValue)(itemsSchema, locale)
                        : (0, exports.generateMockData)(itemsSchema, openApiSchema, locale));
                }
            }
            else if (key === "id") {
                acc[key] = (0, exports.generateRandomValue)(resolvedValue, locale);
            }
            else {
                acc[key] =
                    resolvedValue.example ?? (0, exports.generateRandomValue)(resolvedValue, locale);
            }
            return acc;
        }, {});
    }
    if (resolvedSchema.type === "array" && resolvedSchema.items) {
        if (resolvedSchema.example) {
            return resolvedSchema.example;
        }
        const resolvedItems = (0, exports.resolveRef)(resolvedSchema.items, openApiSchema);
        const length = faker_1.faker.number.int({ min: 1, max: 5 });
        if (resolvedItems.type === "object" &&
            resolvedItems.properties &&
            "id" in resolvedItems.properties) {
            const usedIds = new Set();
            return Array.from({ length }, () => {
                let item;
                let id;
                do {
                    item = (0, exports.generateMockData)(resolvedItems, openApiSchema, locale);
                    id = item.id;
                } while (usedIds.has(id));
                usedIds.add(id);
                return item;
            });
        }
        return Array.from({ length }, () => ["string", "number", "integer", "boolean"].includes(resolvedItems.type || "")
            ? (0, exports.generateRandomValue)(resolvedItems, locale)
            : (0, exports.generateMockData)(resolvedItems, openApiSchema, locale));
    }
    const randomValue = (0, exports.generateRandomValue)(resolvedSchema, locale);
    if (Array.isArray(randomValue)) {
        return randomValue;
    }
    if (typeof randomValue === "object" && randomValue !== null) {
        return randomValue;
    }
    return { value: randomValue };
};
exports.generateMockData = generateMockData;
/**
 * エラーレスポンスを生成する
 */
const generateErrorResponse = (statusCode) => ({
    statusCode,
    message: {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Internal Server Error",
    }[statusCode] || "Unknown Error",
});
exports.generateErrorResponse = generateErrorResponse;
/**
 * パスパラメータをMSWのパスパラメータ形式に変換する
 */
const convertPathToMswPattern = (path) => {
    return path.replace(/\{([^}]+)\}/g, ":$1");
};
exports.convertPathToMswPattern = convertPathToMswPattern;
//# sourceMappingURL=utils.js.map