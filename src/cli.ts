#!/usr/bin/env node

import { writeFileSync } from "fs";
import { resolve } from "path";
import { loadConfig } from "./config/loadConfig";
import { type CliOptions, generateHandlerCode } from "./index";
import { showHelp } from "./options/help";
import { showVersion } from "./options/version";
import { loadOpenApiSchema } from "./parse";

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
		console.info(`Loading OpenAPI schema from: ${options.input}`);
		const openApiSchema = loadOpenApiSchema(options.input);

		// MSWハンドラーコードを生成
		console.info("Generating MSW handlers...");
		const handlerCode = generateHandlerCode(openApiSchema, {
			baseUrl: options.baseUrl,
			errorRate: options.errorRate,
			locale: options.locale,
		});

		// ファイルに出力
		console.info(`Writing handlers to: ${options.output}`);
		writeFileSync(resolve(options.output), handlerCode, "utf8");

		console.info("✅ MSW handlers generated successfully!");
	} catch (error) {
		console.error(`Error generating handlers: ${error}`);
		process.exit(1);
	}
};

// CLIが直接実行された場合のみmain関数を実行
if (require.main === module) {
	main();
}
