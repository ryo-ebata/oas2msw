#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const loadConfig_1 = require("./config/loadConfig");
const index_1 = require("./index");
const help_1 = require("./options/help");
const version_1 = require("./options/version");
const parse_1 = require("./parse");
/**
 * CLIオプションを解析する
 */
const parseArgs = () => {
    const args = process.argv.slice(2);
    const options = {};
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
                (0, help_1.showHelp)();
                process.exit(0);
                break;
            case "-v":
            case "--version":
                (0, version_1.showVersion)();
                process.exit(0);
                break;
        }
    }
    return options;
};
/**
 * メイン処理
 */
const main = () => {
    const cliOptions = parseArgs();
    const configOptions = (0, loadConfig_1.loadConfig)(cliOptions.config);
    const options = { ...configOptions, ...cliOptions };
    // 必須オプションのチェック
    if (!options.input) {
        console.error("Error: Input file is required. Use -i or --input option.");
        (0, help_1.showHelp)();
        process.exit(1);
    }
    if (!options.output) {
        console.error("Error: Output file is required. Use -o or --output option.");
        (0, help_1.showHelp)();
        process.exit(1);
    }
    try {
        // OpenAPIスキーマを読み込み
        console.info(`Loading OpenAPI schema from: ${options.input}`);
        const openApiSchema = (0, parse_1.loadOpenApiSchema)(options.input);
        // MSWハンドラーコードを生成
        console.info("Generating MSW handlers...");
        const handlerCode = (0, index_1.generateHandlerCode)(openApiSchema, {
            baseUrl: options.baseUrl,
            errorRate: options.errorRate,
            locale: options.locale,
        });
        // ファイルに出力
        console.info(`Writing handlers to: ${options.output}`);
        (0, fs_1.writeFileSync)((0, path_1.resolve)(options.output), handlerCode, "utf8");
        console.info("✅ MSW handlers generated successfully!");
    }
    catch (error) {
        console.error(`Error generating handlers: ${error}`);
        process.exit(1);
    }
};
// CLIが直接実行された場合のみmain関数を実行
if (require.main === module) {
    main();
}
//# sourceMappingURL=cli.js.map