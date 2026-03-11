---
title: "[AI-8] AI設定パネル: LLM APIキー管理と接続設定UI"
labels: ["enhancement", "Phase 2: Ecosystem", "beginner-ux"]
---

## 概要

AI連携機能（AI-4, AI-5等）の前提となる **LLM APIキーの安全な管理UI** と接続設定パネルを実装する。CLAUDE.mdのセキュリティルールFに厳密に準拠する。

## 背景・動機

AI-4（インテリジェント・サジェスト）、AI-5（自然言語スキーマ生成）等のAI連携機能には、LLM APIへのアクセスが必要である。ユーザーのAPIキーを安全に管理するための共通基盤が先に必要。

## 実装内容

### 1. AI設定パネル UI

- `AppLayout` のツールバーにAI設定アイコン（歯車 or ブレイン）を追加
- モーダルまたはサイドパネルとして開く設定画面

### 2. LLMプロバイダー設定

| プロバイダー | 設定項目 |
|---|---|
| OpenAI | APIキー、モデル選択（gpt-4o, gpt-4o-mini） |
| Anthropic | APIキー、モデル選択（claude-sonnet-4-6, claude-haiku-4-5） |
| Ollama（ローカル） | サーバーURL（default: http://localhost:11434）、モデル名 |
| カスタム | OpenAI互換エンドポイントURL、APIキー |

### 3. セキュリティ要件（CLAUDE.md Section F準拠）

- APIキーは `localStorage` のみに保存
- UI上に警告表示: 「このトークンはブラウザのlocalStorageに保存されます。共有PCでは使用しないでください。」
- 各プロバイダーに「トークンをクリア」ボタン（`localStorage.removeItem(key)` 実行）
- APIキーをURL、URLハッシュ、共有リンクに **絶対に含めない**（#18 E-1共有リンク機能との連携時に注意）
- APIキーの入力欄は `type="password"` を使用

### 4. 接続テスト機能

- 「接続テスト」ボタンで各プロバイダーへの疎通確認
- 成功/失敗のステータス表示

## 技術設計

```typescript
// src/lib/ai/llmClient.ts
export type LlmProvider = 'openai' | 'anthropic' | 'ollama' | 'custom'

export interface LlmConfig {
  provider: LlmProvider
  apiKey?: string           // localStorage に保存
  model: string
  baseUrl?: string          // Ollama/カスタム用
}

export function createLlmClient(config: LlmConfig): LlmClient
export function testConnection(config: LlmConfig): Promise<boolean>
```

```typescript
// src/store/aiStore.ts
interface AiState {
  config: LlmConfig | null
  isConnected: boolean
  isEnabled: boolean        // AI機能全体のON/OFF
}
```

## 受け入れ条件

- [ ] 設定パネルUIが開閉可能に動作する
- [ ] OpenAI/Anthropic/Ollama/カスタムの各プロバイダー設定が可能
- [ ] APIキーが `localStorage` のみに保存されている（ソースコード・URL・コンソールに漏洩しない）
- [ ] 「トークンをクリア」ボタンが正しく動作する
- [ ] 接続テストが成功/失敗を正しく表示する
- [ ] i18n対応（en.json/ja.json）
- [ ] セキュリティ警告が適切に表示される

## 関連Issue
- AI-4 (インテリジェント・サジェスト) — 本設定パネルのAPIキーを使用
- AI-5 (自然言語スキーマ生成) — 本設定パネルのAPIキーを使用
- #24 [I-1] 自然言語 → Turtle 生成 — 同じくLLM APIキーが必要
