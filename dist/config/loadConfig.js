"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const loadConfig = (configPath) => {
    if (!configPath)
        return {};
    try {
        const configFile = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(configPath), "utf8");
        return JSON.parse(configFile);
    }
    catch (error) {
        console.error(`Error loading config file: ${error}`);
        process.exit(1);
    }
};
exports.loadConfig = loadConfig;
//# sourceMappingURL=loadConfig.js.map