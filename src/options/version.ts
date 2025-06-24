import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
export const showVersion = (): void => {
	const packageJson = JSON.parse(
		readFileSync(resolve(__dirname, "../../package.json"), "utf8"),
	);
	console.info(`oas2msw v${packageJson.version}`);
};
