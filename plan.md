# oas2msw - OpenAPI to MSW Mock Generator

## プロジェクト概要
OpenAPI JSONのAPI定義を読み込んで、MSW（Mock Service Worker）のモックハンドラーを自動生成するOSSプロジェクト

## 参考コード分析
添付されたindex.tsファイルから以下の重要な機能を確認：
- OpenAPI JSONスキーマの解析
- 型定義（SchemaProperty, ResponseDefinition, Operation等）
- スキーマ参照の解決（resolveRef）
- モックデータ生成（generateRandomValue, generateMockData）
- エラーレスポンス生成
- MSWハンドラーの自動生成

## 技術スタック
- TypeScript
- MSW (Mock Service Worker)
- Faker.js（モックデータ生成）
- OpenAPI 3.0対応

## Task List
- [x] プロジェクト構造の設計
- [x] package.jsonの作成と依存関係の設定
- [x] 型定義ファイルの作成
- [x] ユーティリティ関数の実装
- [x] メインのモック生成ロジックの実装
- [x] CLIツールの実装
- [x] テストの作成
- [x] README.mdの作成
- [x] ライセンスファイルの追加
- [x] 依存関係のインストールとビルドテスト
- [x] 実際のOpenAPIファイルでの動作確認
- [ ] 出力TypeScriptコードの品質改善（generateMockDataの実装出力、ハンドラー名の重複修正など）
- [ ] モック生成エンジンのモジュール化
- [ ] 静的生成・動的生成の両インターフェースを提供
- [ ] ドキュメント・READMEの更新

## Current Goal
モック生成エンジンをモジュール化し、静的・動的両方のインターフェースを提供する

## Notes
- 参考コードは日本語ロケールのFakerを使用
- 環境設定（envConfig）に依存している部分を分離する必要がある
- エラーレスポンスは5%の確率で発生する仕様
- IDフィールドの重複を避ける仕組みが実装されている
- TypeScriptの型定義エラーが発生しているが、依存関係のインストール後に解決される見込み
- プロジェクトの基本構造は完成し、以下のファイルが作成済み：
  - package.json（依存関係とスクリプト設定）
  - tsconfig.json（TypeScript設定）
  - src/types.ts（型定義）
  - src/utils.ts（ユーティリティ関数）
  - src/generator.ts（メイン生成ロジック）
  - src/index.ts（エントリーポイント）
  - src/cli.ts（CLIツール）
  - README.md（使用方法説明）
  - LICENSE（MITライセンス）
  - .eslintrc.js（ESLint設定）
  - .prettierrc（Prettier設定）
  - jest.config.js（Jest設定）
  - examples/sample-openapi.json（サンプルファイル）
  - src/__tests__/generator.test.ts（テストファイル）
- 出力されたTypeScriptコードに以下の課題あり：
  - generateMockData()の実装が含まれていないため、そのままでは動作しない
  - handler0などの変数名が重複している
  - 今後、利用者がすぐ使える形でのコード出力改善が必要
- 新たな要件：
  - モック生成エンジンをモジュール化し、静的生成（CLI/コード出力）・動的生成（ランタイム生成）の両方のインターフェースを提供する 
