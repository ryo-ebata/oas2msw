import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CliOptions } from "../types";

export const loadConfig = (configPath?: string): Partial<CliOptions> => {
	if (!configPath) return {};

	try {
		const configFile = readFileSync(resolve(configPath), "utf8");
		return JSON.parse(configFile);
	} catch (error) {
		console.error(`Error loading config file: ${error}`);
		process.exit(1);
	}
};
