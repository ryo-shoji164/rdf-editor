---
title: "[AI-5] 自然言語ベースのスキーマ・オントロジー生成: AIチャットからのグラフ自動構築"
labels: ["enhancement", "Phase 3: Enterprise", "beginner-ux"]
---

## 概要

チャットインターフェースに自然言語で要件を入力するだけで、LLMが初期のクラス構造、プロパティ構成、制約事項（SHACL等）を自動生成し、エディターのグラフキャンバス上に展開する **「自然言語→オントロジー」生成機能** を実装する。

## 背景・動機

白紙の状態からオントロジーやナレッジグラフの設計を始める「コールドスタート問題」は、特にRDF初心者にとって最大の障壁の一つである。本機能により:

- 「マイクロサービスアーキテクチャとその依存関係を表現するオントロジーを作りたい」と入力するだけで初期スキーマが生成される
- ドメイン専門家がRDFの文法を知らなくてもグラフモデリングを開始できる
- 既存テンプレート機能（TemplateMenu）を大幅に超える柔軟性を提供

## 実装内容

### 1. チャットパネル UI

- サイドパネルとして開閉可能なチャットウィンドウを `AppLayout` に統合
- メッセージ履歴表示（ユーザー/AI）
- Markdown対応のAI回答レンダリング
- 「グラフに適用」ボタンで生成結果を即座にエディターに反映

### 2. 自然言語→RDF生成エンジン

```typescript
// src/lib/ai/schemaGenerator.ts
export interface SchemaGenerationRequest {
  description: string           // ユーザーの自然言語記述
  existingPrefixes: Record<string, string>  // 現在のプレフィックス
  activeDomain: string          // 現在のドメインプラグインID
  existingGraph?: string        // 既存グラフの軽量表現（追加生成の場合）
}

export interface SchemaGenerationResult {
  turtle: string                // 生成されたTurtle
  explanation: string           // 生成内容の説明（日本語/英語）
  suggestedPrefixes: Record<string, string>
}
```

### 3. 対話型リファインメント

- 初回生成後、ユーザーが追加の要件を自然言語で指示:
  - 「このクラスにemailプロパティを追加して」
  - 「PersonとOrganizationの間にworksFor関係を追加して」
- 差分のみをグラフに適用（既存データを上書きしない）

### 4. 対話型エラー検出・リファクタリング

- 「このグラフでドメイン制約に違反している箇所を見つけて」等のデバッグ指示
- AIが該当箇所をグラフ上でハイライトし、修正案を提示
- SHACL検証結果とLLM分析の組み合わせ

## ディレクトリ構造案

```
src/
├── components/
│   └── chat/
│       ├── ChatPanel.tsx          # チャットサイドパネル
│       ├── ChatMessage.tsx        # メッセージバブル
│       └── ApplyToGraphButton.tsx # 生成結果の適用ボタン
├── lib/
│   └── ai/
│       ├── schemaGenerator.ts     # 自然言語→RDF変換ロジック
│       ├── chatHistory.ts         # チャット履歴管理
│       └── promptTemplates.ts     # システムプロンプトテンプレート
└── store/
    └── chatStore.ts               # チャット状態管理（Zustand）
```

## 受け入れ条件

- [ ] チャットパネルUIが開閉可能に動作する
- [ ] 自然言語入力から有効なTurtleが生成される
- [ ] 生成結果がグラフキャンバスに正しく反映される
- [ ] 対話型のリファインメント（追加指示）が機能する
- [ ] APIキー未設定時に適切なガイダンスが表示される
- [ ] i18n対応（en.json/ja.json）

## 関連Issue
- #24 [I-1] 自然言語 → Turtle 生成 — 本issueはその拡張版（チャットUI + 対話型リファインメント）
- AI-4 (インテリジェント・サジェスト) — サジェストエンジンの基盤を共有
- AI-1 (MCPサーバー) — MCPクライアントからも本機能を呼び出し可能にする
