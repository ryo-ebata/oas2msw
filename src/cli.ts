#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { type CliOptions, generateHandlerCode } from "./index";

/**
 * CLIオプションを解析する
 */
const parseArgs = (): CliOptions => {
	const args = process.argv.slice(2);
	const options: Partial<CliOptions> = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		const nextArg = args[i + 1];

		switch (arg) {
			case "-i":
			case "--input":
				if (nextArg) {
					options.input = nextArg;
					i++;
				}
				break;
			case "-o":
			case "--output":
				if (nextArg) {
					options.output = nextArg;
					i++;
				}
				break;
			case "--base-url":
				if (nextArg) {
					options.baseUrl = nextArg;
					i++;
				}
				break;
			case "--error-rate":
				if (nextArg) {
					options.errorRate = parseFloat(nextArg);
					i++;
				}
				break;
			case "--locale":
				if (nextArg) {
					options.locale = nextArg;
					i++;
				}
				break;
			case "--config":
				if (nextArg) {
					options.config = nextArg;
					i++;
				}
				break;
			case "-h":
			case "--help":
				showHelp();
				process.exit(0);
				break;
			case "-v":
			case "--version":
				showVersion();
				process.exit(0);
				break;
		}
	}

	return options as CliOptions;
};

/**
 * ヘルプメッセージを表示する
 */
const showHelp = (): void => {
	console.log(`
oas2msw - Generate MSW handlers from OpenAPI JSON schema

Usage: oas2msw [options]

Options:
  -i, --input <file>        Input OpenAPI JSON file (required)
  -o, --output <file>       Output TypeScript file (required)
  --base-url <url>          Base URL for API endpoints
  --error-rate <rate>       Error response rate (0.0-1.0, default: 0.05)
  --locale <locale>         Faker.js locale (default: en)
  --config <file>           Configuration file
  -h, --help               Show this help message
  -v, --version            Show version

Examples:
  oas2msw -i openapi.json -o handlers.ts
  oas2msw -i openapi.json -o handlers.ts --base-url https://api.example.com
  oas2msw -i openapi.json -o handlers.ts --error-rate 0.1 --locale ja
`);
};

/**
 * バージョン情報を表示する
 */
const showVersion = (): void => {
	const packageJson = JSON.parse(
		readFileSync(resolve(__dirname, "../package.json"), "utf8"),
	);
	console.log(`oas2msw v${packageJson.version}`);
};

/**
 * 設定ファイルを読み込む
 */
const loadConfig = (configPath?: string): Partial<CliOptions> => {
	if (!configPath) return {};

	try {
		const configFile = readFileSync(resolve(configPath), "utf8");
		return JSON.parse(configFile);
	} catch (error) {
		console.error(`Error loading config file: ${error}`);
		process.exit(1);
	}
};

/**
 * OpenAPI JSONファイルを読み込む
 */
const loadOpenApiSchema = (inputPath: string): any => {
	try {
		const fileContent = readFileSync(resolve(inputPath), "utf8");
		return JSON.parse(fileContent);
	} catch (error) {
		console.error(`Error loading OpenAPI schema: ${error}`);
		process.exit(1);
	}
};

/**
 * メイン処理
 */
const main = (): void => {
	const cliOptions = parseArgs();
	const configOptions = loadConfig(cliOptions.config);
	const options = { ...configOptions, ...cliOptions };

	// 必須オプションのチェック
	if (!options.input) {
		console.error("Error: Input file is required. Use -i or --input option.");
		showHelp();
		process.exit(1);
	}

	if (!options.output) {
		console.error("Error: Output file is required. Use -o or --output option.");
		showHelp();
		process.exit(1);
	}

	try {
		// OpenAPIスキーマを読み込み
		console.log(`Loading OpenAPI schema from: ${options.input}`);
		const openApiSchema = loadOpenApiSchema(options.input);

		// MSWハンドラーコードを生成
		console.log("Generating MSW handlers...");
		const handlerCode = generateHandlerCode(openApiSchema, {
			baseUrl: options.baseUrl,
			errorRate: options.errorRate,
			locale: options.locale,
		});

		// ファイルに出力
		console.log(`Writing handlers to: ${options.output}`);
		writeFileSync(resolve(options.output), handlerCode, "utf8");

		console.log("✅ MSW handlers generated successfully!");
	} catch (error) {
		console.error(`Error generating handlers: ${error}`);
		process.exit(1);
	}
};

// CLIが直接実行された場合のみmain関数を実行
if (require.main === module) {
	main();
}
