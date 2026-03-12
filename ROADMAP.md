# RDF Editor — AI機能強化ロードマップ

このドキュメントは、RDF EditorをAIネイティブ時代に対応させるための機能強化ロードマップです。
詳細は各IssueおよびGitHub Issues一覧を参照してください。

---

## 戦略的方向性

| 柱 | 概要 |
|---|---|
| **MCP-First** | 人間向けGUIとAI向けAPIを同時に提供する統合環境 |
| **GraphRAG Hub** | LLM抽出→人間レビュー→グラフDBというパイプラインの中核ツール |
| **Token Efficiency** | 標準RDFとLLM最適化フォーマットの仲介レイヤー |

---

## フェーズ別ロードマップ

### Phase 1: Foundation（基盤整備）

前提条件となる共通基盤を整備するフェーズ。

| Issue | タイトル | 依存関係 |
|---|---|---|
| [#99](https://github.com/ryo-shoji164/rdf-editor/issues/99) | [AI-8] AI設定パネル: LLM APIキー管理と接続設定UI | — |
| [#100](https://github.com/ryo-shoji164/rdf-editor/issues/100) | [AI-2] LLMトークン最適化シリアライゼーション | — |
| [#101](https://github.com/ryo-shoji164/rdf-editor/issues/101) | [AI-7] GraphRAGユースケーステンプレートの拡充 | — |

**目標**: AIを活用するための設定UI、軽量フォーマット変換、実践的テンプレートを提供する。

---

### Phase 2: Core（コア機能実装）

差別化ポイントとなるコア機能を実装するフェーズ。

| Issue | タイトル | 依存関係 |
|---|---|---|
| [#102](https://github.com/ryo-shoji164/rdf-editor/issues/102) | [AI-6] グラフアルゴリズム統合: コミュニティ検出・構造分析 | #100 |
| [#103](https://github.com/ryo-shoji164/rdf-editor/issues/103) | [AI-1] MCPサーバー機能の実装 ⭐最大の差別化ポイント | #99, #100 |
| [#104](https://github.com/ryo-shoji164/rdf-editor/issues/104) | [AI-3] GraphRAGデバッグハブ: ビジュアル検証・クレンジング | #99, #100 |

**目標**: MCPサーバーとして公開し、Claude Desktop等のAIエージェントからRDFデータを直接操作可能にする。

---

### Phase 3: AI Collaboration（AI協調機能）

ユーザーとAIが協調して作業できる体験を提供するフェーズ。

| Issue | タイトル | 依存関係 |
|---|---|---|
| [#105](https://github.com/ryo-shoji164/rdf-editor/issues/105) | [AI-4] コンテキスト認識型インテリジェント・サジェスト | #99, #103 |
| [#106](https://github.com/ryo-shoji164/rdf-editor/issues/106) | [AI-5] 自然言語ベースのスキーマ・オントロジー生成 | #99, #103 |

**目標**: グラフモデリングのCopilot体験と、自然言語からのオントロジー自動生成を実現する。

---

### Phase 4: Ecosystem（エコシステム展開）

OSSとしての認知度・コミュニティを拡大するフェーズ。

| Issue | タイトル | 依存関係 |
|---|---|---|
| [#107](https://github.com/ryo-shoji164/rdf-editor/issues/107) | [AI-9] OSS戦略: MCPエコシステムへの登録とAIネイティブ・ドキュメント整備 | #103 |

**目標**: Awesome MCP Servers等への登録、llms.txtの整備、GitHub Discussionsの活性化。

---

## 依存関係グラフ

```
Phase 1 (Foundation)
├── #99  AI-8: AI設定パネル ──────────────┐
├── #100 AI-2: トークン最適化 ────────────┤──→ Phase 2
└── #101 AI-7: GraphRAGテンプレート        │
                                          │
Phase 2 (Core)                            │
├── #102 AI-6: コミュニティ検出 ← #100    │
├── #103 AI-1: MCPサーバー ← #99, #100 ──┼──→ Phase 3, 4
└── #104 AI-3: GraphRAGハブ ← #99, #100  │
                                          │
Phase 3 (AI Collaboration)                │
├── #105 AI-4: インテリジェント提案 ← #99, #103
└── #106 AI-5: 自然言語スキーマ生成 ← #99, #103

Phase 4 (Ecosystem)
└── #107 AI-9: OSS戦略 ← #103
```

---

## 優先度マトリクス

| 優先度 | Issue | 理由 |
|---|---|---|
| 🔴 最高 | #99 AI-8 | 他のAI機能すべての前提条件 |
| 🔴 最高 | #103 AI-1 | 最大の差別化ポイント（MCPサーバー） |
| 🟠 高 | #100 AI-2 | トークン効率化でLLM連携コストを削減 |
| 🟠 高 | #104 AI-3 | GraphRAGユースケースの即時価値提供 |
| 🟡 中 | #101 AI-7 | ユーザーのTime-to-Value短縮 |
| 🟡 中 | #102 AI-6 | コミュニティ検出でトークン97%削減 |
| 🟢 通常 | #105 AI-4 | グラフモデリング体験の革新 |
| 🟢 通常 | #106 AI-5 | コールドスタート問題の解消 |
| 🔵 後続 | #107 AI-9 | MCPサーバー完成後に実施 |
