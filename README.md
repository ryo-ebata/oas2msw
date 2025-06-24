# oas2msw

OpenAPI JSONスキーマからMSW（Mock Service Worker）ハンドラーを自動生成するTypeScriptライブラリです。

## 特徴

- 🚀 OpenAPI 3.0スキーマからMSWハンドラーを自動生成
- 🎲 Faker.jsを使用したリアルなモックデータ生成
- 🌍 多言語対応（ロケール設定可能）
- ⚡ エラーレスポンスの自動生成
- 🔧 カスタマイズ可能な設定オプション
- 📦 TypeScript完全対応

## インストール

```bash
npm install oas2msw
```

## 使用方法

### CLIツール

```bash
# 基本的な使用方法
npx oas2msw -i openapi.json -o handlers.ts

# ベースURLを指定
npx oas2msw -i openapi.json -o handlers.ts --base-url https://api.example.com

# エラーレートとロケールを指定
npx oas2msw -i openapi.json -o handlers.ts --error-rate 0.1 --locale ja
```

### プログラムでの使用

```typescript
import { generateHandlers, generateHandlerCode } from 'oas2msw';
import openApiSchema from './openapi.json';

// MSWハンドラーを生成
const handlers = generateHandlers(openApiSchema, {
  baseUrl: 'https://api.example.com',
  errorRate: 0.05,
  locale: 'ja',
});

// TypeScriptコードとして生成
const handlerCode = generateHandlerCode(openApiSchema, {
  baseUrl: 'https://api.example.com',
  errorRate: 0.05,
  locale: 'ja',
});
```

## 設定オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|----|-----------|------|
| `baseUrl` | string | `''` | APIエンドポイントのベースURL |
| `errorRate` | number | `0.05` | エラーレスポンスの発生確率（0.0-1.0） |
| `locale` | string | `'en'` | Faker.jsのロケール設定 |
| `customGenerators` | object | `{}` | カスタムデータ生成関数 |

## CLIオプション

```bash
Options:
  -i, --input <file>        Input OpenAPI JSON file (required)
  -o, --output <file>       Output TypeScript file (required)
  --base-url <url>          Base URL for API endpoints
  --error-rate <rate>       Error response rate (0.0-1.0, default: 0.05)
  --locale <locale>         Faker.js locale (default: en)
  --config <file>           Configuration file
  -h, --help               Show this help message
  -v, --version            Show version
```

## 生成されるコード例

```typescript
import { http, type HttpHandler, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

// Handler 1
const handler0: HttpHandler = http.get('https://api.example.com/users', () => {
  return HttpResponse.json({
    items: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ]
  });
});

export const handlers: HttpHandler[] = [
  handler0,
];
```

## 対応しているOpenAPI機能

- ✅ パスパラメータ
- ✅ クエリパラメータ
- ✅ リクエストボディ
- ✅ レスポンススキーマ
- ✅ スキーマ参照（$ref）
- ✅ 列挙型（enum）
- ✅ 配列型
- ✅ オブジェクト型
- ✅ 基本データ型（string, number, boolean）
- ✅ フォーマット（email, date-time, uuid等）

## 開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# テスト
npm test

# リント
npm run lint

# フォーマット
npm run format
```

## ライセンス

MIT

## 貢献

プルリクエストやイシューの報告を歓迎します！
