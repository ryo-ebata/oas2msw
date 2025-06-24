// OpenAPI Schema Types
export interface OpenApiSchema {
	openapi: string;
	info: {
		title: string;
		version: string;
		description?: string;
	};
	paths: Record<string, PathItem>;
	components?: {
		schemas?: Record<string, SchemaProperty>;
	};
}

export interface PathItem {
	get?: Operation;
	post?: Operation;
	put?: Operation;
	delete?: Operation;
	patch?: Operation;
	parameters?: Parameter[];
}

export interface Operation {
	summary?: string;
	description?: string;
	parameters?: Parameter[];
	requestBody?: RequestBody;
	responses: Record<string, ResponseDefinition>;
	tags?: string[];
}

export interface Parameter {
	name: string;
	in: "path" | "query" | "header" | "cookie";
	required?: boolean;
	schema?: SchemaProperty;
	description?: string;
}

export interface RequestBody {
	required?: boolean;
	content: Record<string, MediaType>;
}

export interface MediaType {
	schema?: SchemaProperty;
	example?: unknown;
}

export interface ResponseDefinition {
	description?: string;
	content?: Record<string, MediaType>;
}

export interface SchemaProperty {
	type?: string;
	format?: string;
	example?: unknown;
	properties?: Record<string, SchemaProperty>;
	items?: SchemaProperty;
	$ref?: string;
	enum?: unknown[];
	minimum?: number;
	maximum?: number;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	description?: string;
	required?: string[];
	allOf?: SchemaProperty[];
	anyOf?: SchemaProperty[];
	oneOf?: SchemaProperty[];
	not?: SchemaProperty;
	nullable?: boolean;
	readOnly?: boolean;
	writeOnly?: boolean;
	deprecated?: boolean;
}

// MSW Handler Types
export interface MswHandlerConfig {
	baseUrl?: string;
	errorRate?: number;
	locale?: string;
	customGenerators?: Record<string, CustomGenerator>;
}

export type CustomGenerator = (
	schema: SchemaProperty,
	context: GeneratorContext,
) => unknown;

export interface GeneratorContext {
	faker: any;
	path: string;
	method: string;
	operation: Operation;
}

export interface ErrorSchema {
	status: number;
	schema?: SchemaProperty;
}

// CLI Types
export interface CliOptions {
	input: string;
	output: string;
	baseUrl?: string;
	errorRate?: number;
	locale?: string;
	config?: string;
}
