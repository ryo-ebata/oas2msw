"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showVersion = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
/**
 * Displays the current version of the oas2msw package
 *
 * Reads the version from package.json and outputs it to the console
 * in the format "oas2msw v{version}"
 *
 * @example
 * ```typescript
 * showVersion(); // Outputs: oas2msw v1.0.0
 * ```
 *
 * @throws {Error} If package.json cannot be read or parsed
 * @returns {void} Nothing is returned, version is logged to console
 */
const showVersion = () => {
    const packageJson = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)(__dirname, "../../package.json"), "utf8"));
    console.info(`oas2msw v${packageJson.version}`);
};
exports.showVersion = showVersion;
//# sourceMappingURL=version.js.map