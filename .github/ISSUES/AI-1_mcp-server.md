---
title: "[AI-1] MCPサーバー機能の実装: RDFエディターをAIエージェント対応のMCPサーバーとして公開"
labels: ["enhancement", "Phase 3: Enterprise", "integration"]
---

## 概要

RDFエディターの内部ロジックを **Model Context Protocol (MCP) サーバー** として公開するアーキテクチャを実装する。

MCPはAnthropicが提唱した、AIアプリケーションと外部データソースを安全かつ標準化された方法で接続するためのオープンプロトコルであり、「AIのためのUSB-Cポート」と形容されている。本エディターがMCPサーバーとして機能することで、Claude Desktop、Cursor、VS Code等のMCPクライアントから直接RDFデータを探索・編集できるようになる。

## 背景・動機

- RDF/ナレッジグラフの普及を阻む最大の障壁は、SPARQL構文の習得やオントロジーの深い技術的理解が必要な点
- MCPを実装することで、自然言語によるグラフ探索が可能になり、この障壁を劇的に下げられる
- 競合分析: `mcp-rdf-explorer` はバックエンド（CUI）のみでリッチなGUIを持たない。本エディターは **「GUI + MCPサーバー」の統合環境** という独自のポジションを確立できる

## 実装すべきMCPコンポーネント

### Resources
| エンドポイント | 目的 |
|---|---|
| `schema://all` | グラフ内の全クラス・プロパティ（スキーマ情報）をLLMに提供 |
| `explore://{query_name}` | 事前定義された探索的SPARQLクエリの実行結果をJSON形式で返却 |

### Tools
| ツール名 | 目的 |
|---|---|
| `text_to_sparql` | 自然言語→SPARQLクエリ変換・実行 |
| `graph_stats` | トリプル総数、ユニーク主語数、プロパティ頻度等の統計情報 |
| `add_triples` | LLMが生成したトリプルをグラフに追加 |
| `validate_graph` | 現在のグラフに対するSHACL検証の実行 |

### Prompts
| プロンプト名 | 目的 |
|---|---|
| `analyze_graph_structure` | グラフ構造の包括的分析を開始するための構造化テンプレート |

## 技術要件

- `@modelcontextprotocol/sdk` パッケージの導入
- STDIO（標準入出力）ベースのMCPサーバー実装（ローカル利用向け）
- SSE（Server-Sent Events）ベースのHTTP実装（リモート利用向け）
- 既存の `src/lib/rdf/` 内のパーサー・ストアロジックをMCPツールから呼び出せるよう抽象化
- セキュリティ: MCPサーバー経由のグラフ操作にも既存のバリデーションルールを適用

## 実装フェーズ

1. **Phase 1**: コアMCPサーバーの骨格実装（STDIO transport）
2. **Phase 2**: Resources（schema, explore）の実装
3. **Phase 3**: Tools（graph_stats, validate_graph, add_triples）の実装
4. **Phase 4**: SSE/HTTP transport対応
5. **Phase 5**: text_to_sparql（自然言語→SPARQL）の実装

## ディレクトリ構造案

```
src/
├── mcp/
│   ├── server.ts              # MCPサーバーエントリーポイント
│   ├── resources/
│   │   ├── schemaResource.ts  # schema://all
│   │   └── exploreResource.ts # explore://{query}
│   ├── tools/
│   │   ├── graphStats.ts
│   │   ├── validateGraph.ts
│   │   ├── addTriples.ts
│   │   └── textToSparql.ts
│   └── prompts/
│       └── analyzeStructure.ts
```

## 関連Issue
- #24 [I-1] 自然言語 → Turtle 生成 — MCPの text_to_sparql と連携
- #20 [E-3] SPARQL エンドポイント接続 — MCPのリモートSPARQL機能と統合

## 参考資料
- [MCP公式仕様](https://modelcontextprotocol.io/)
- [mcp-rdf-explorer](https://github.com/kustomzone/mcp-rdf-explorer)
- GraphDB MCP連携事例
