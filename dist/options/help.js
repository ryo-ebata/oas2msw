"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showHelp = void 0;
const showHelp = () => {
    console.info(`
oas2msw - Generate MSW handlers from OpenAPI schema (YAML/JSON)

Usage: oas2msw [options]

Options:
  -i, --input <file>        Input OpenAPI file (YAML or JSON, required)
  -o, --output <file>       Output TypeScript file (required)
  --base-url <url>          Base URL for API endpoints
  --error-rate <rate>       Error response rate (0.0-1.0, default: 0.05)
  --locale <locale>         Faker.js locale (default: en)
  --config <file>           Configuration file
  -h, --help               Show this help message
  -v, --version            Show version

Examples:
  oas2msw -i openapi.json -o handlers.ts
  oas2msw -i openapi.yaml -o handlers.ts
  oas2msw -i openapi.yml -o handlers.ts
  oas2msw -i openapi.json -o handlers.ts --base-url https://api.example.com
  oas2msw -i openapi.yaml -o handlers.ts --error-rate 0.1 --locale ja
`);
};
exports.showHelp = showHelp;
//# sourceMappingURL=help.js.map