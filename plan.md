# oas2msw - OpenAPI to MSW Handler Generator

## Notes
- プロジェクトの目的：OpenAPI仕様からMSWハンドラーを自動生成するツール
- 現在の状況：OpenAPI JSONファイルのみ対応
- 要求：OpenAPI YAMLファイルにも対応できるようパース層を実装
- 既存のMockEngine.tsは変更せず、パース層で差分を吸収する設計
- 現在の実装：src/cli.tsのloadOpenApiSchema関数でJSON.parse()のみ使用
- 必要な依存関係：js-yamlパッケージを追加する必要がある
- parse層を新規実装し、YAML/JSON両対応のloadOpenApiSchema関数を提供
- CLI・テスト・サンプルでYAML/JSON両方の動作を確認済み
- パース層の単体テストも追加し、全テストパスを確認

## Task List
- [x] @/parseディレクトリの構造を確認
- [x] OpenAPI YAML/JSON両対応のパース層を設計
- [x] js-yamlパッケージを依存関係に追加
- [x] YAMLファイル読み込み機能を実装
- [x] JSONファイル読み込み機能を実装
- [x] 統一されたインターフェースでスキーマを返す機能を実装
- [x] MockEngine.tsとの統合テスト
- [x] 既存のテストケースの更新
- [x] パース層の単体テストを追加

## Current Goal
OpenAPI YAMLファイルとJSONファイルの両方に対応できるパース層を実装し、MockEngine.tsが統一されたインターフェースでモック生成を行えるようにする

---

全ての要件を満たし、YAML/JSON両対応のパース層が完成しました。 
