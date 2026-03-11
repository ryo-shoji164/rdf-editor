---
title: "[AI-2] LLMトークン最適化シリアライゼーション: AI向け軽量フォーマット変換機能"
labels: ["enhancement", "Phase 2: Ecosystem", "integration"]
---

## 概要

LLMのコンテキストウィンドウを効率的に利用するため、標準RDFフォーマット（Turtle、JSON-LD）に加えて、**トークン効率の高い軽量フォーマット**（YAML/Markdownベースのエッジリスト）への変換機能を実装する。

## 背景・動機

研究データによると、同一データセットのシリアライゼーション形式によるトークン消費量の差は劇的である:

| 形式 | 平均トークン数/プロンプト | JSON-LD比 |
|---|---|---|
| List-of-Edges / YAML | ~2,903 | **78%削減** |
| 構造化JSON | ~4,504 | 67%削減 |
| RDF Turtle | ~8,171 | 39%削減 |
| JSON-LD | ~13,503 | 基準値 |

JSON-LDやTurtleは相互運用性のために設計されており、URI、名前空間、型定義等の冗長な文字列がLLMにとってはノイズとなる。エディターは「機械間の相互運用性」と「AIモデルへの処理効率性」の両方を満たす仲介レイヤーとして機能すべきである。

## 実装内容

### 1. LLM向け軽量フォーマットへのエクスポート

新たなシリアライゼーション形式として以下を `src/lib/rdf/serializer.ts` に追加:

- **YAML Edge List**: トリプルを `- subject → predicate → object` 形式のYAMLリストとして出力
- **Markdown Edge List**: 見出し付きMarkdownテーブルとして出力
- **Compact JSON**: プレフィックスを展開せず短縮名のみを使用した軽量JSON

### 2. 「AI用コピー」機能

エディターUIに「Copy for AI」ボタンを追加:
- 現在のグラフ全体または選択されたサブグラフを軽量フォーマットでクリップボードにコピー
- フォーマット選択ドロップダウン（YAML / Markdown / Compact JSON）
- コピー時にプレフィックスの自動短縮とURI圧縮を適用

### 3. Context Graph（焦点化サブグラフ）抽出

巨大グラフ全体ではなく、LLMの推論に必要な関連エンティティのみを動的に抽出する機能:
- 選択ノードからの N-hop 近傍サブグラフ抽出
- トークン数上限を指定した自動トリミング（例: 4,000トークン以内）
- 関連性スコアリングに基づくランキング

## 技術設計

```typescript
// src/lib/rdf/llmSerializer.ts
export type LlmFormat = 'yaml-edges' | 'markdown-table' | 'compact-json'

export function serializeForLlm(
  store: N3.Store,
  format: LlmFormat,
  options?: {
    focusNode?: string       // 焦点ノードURI
    maxHops?: number         // 近傍探索の深さ
    maxTokens?: number       // トークン上限（概算）
    prefixMap?: Record<string, string>
  }
): string
```

## UI変更

- ツールバーに「Export for AI」メニュー項目を追加
- グラフビューのコンテキストメニューに「Copy subgraph for AI」を追加
- MCP経由でAIエージェントがこの機能を呼び出し可能にする（AI-1と連携）

## 受け入れ条件

- [ ] 3つの軽量フォーマットでのエクスポートが正常に動作する
- [ ] 同一データでJSON-LDと比較してYAML形式のトークン数が70%以上削減されている
- [ ] Context Graph抽出で指定hop数のサブグラフが正しく切り出される
- [ ] 既存のエクスポート機能（Turtle/N-Triples/JSON-LD）に影響がない
- [ ] 単体テストが追加されている

## 関連Issue
- AI-1 (MCPサーバー) — MCP経由でのフォーマット変換機能として連携
