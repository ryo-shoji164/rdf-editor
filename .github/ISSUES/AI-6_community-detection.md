---
title: "[AI-6] グラフアルゴリズム統合: コミュニティ検出・構造分析機能"
labels: ["enhancement", "Phase 2: Ecosystem", "expert-ux"]
---

## 概要

エディター上から直接グラフアルゴリズム（コミュニティ検出: Leidenアルゴリズム等）を実行し、グラフの構造的要約を生成する機能を実装する。GraphRAGにおけるコミュニティ要約はトークン消費を97%削減できるという研究結果に基づく。

## 背景・動機

- GraphRAGのMicrosoftによる研究では、Leidenアルゴリズムによるコミュニティ検出がルートレベル要約の生成に不可欠
- コミュニティ要約により、LLMへの入力トークンを97%削減しつつ回答の包括性を維持可能
- 現在のCytoscape.jsビューは表示のみで、グラフ分析機能を持たない

## 実装内容

### 1. グラフアルゴリズムエンジン

- **コミュニティ検出**: Leidenアルゴリズム（またはLouvain法）の実装
- **中心性分析**: 次数中心性、媒介中心性、PageRankの計算
- **クラスタリング可視化**: 検出されたコミュニティをCytoscapeグラフ上で色分け表示
- **孤立ノード検出**: 他のノードと接続されていないエンティティの一覧表示

### 2. コミュニティ要約の生成

- 検出された各コミュニティに対して、含まれるエンティティと関係性の要約を自動生成
- 要約はLLMのプロンプトに直接挿入可能な形式（Markdown）で出力
- コミュニティ間の関係性マップも生成

### 3. 分析結果パネル

- グラフ統計情報の表示（ノード数、エッジ数、密度、平均次数）
- コミュニティ一覧とメンバーシップ表示
- 中心性スコアによるノードランキング

## 技術設計

```typescript
// src/lib/graph/algorithms.ts
export interface CommunityResult {
  communities: Map<string, string[]>  // communityId → nodeURIs
  modularity: number
}

export function detectCommunities(
  store: N3.Store,
  algorithm: 'leiden' | 'louvain',
  resolution?: number
): CommunityResult

export function calculateCentrality(
  store: N3.Store,
  metric: 'degree' | 'betweenness' | 'pagerank'
): Map<string, number>
```

### ライブラリ候補

- `graphology` + `graphology-communities-louvain` (JS実装、ブラウザ対応)
- Cytoscape.jsの既存レイアウトエンジンとの連携

## UI変更

- ツールバーに「Analyze」ドロップダウンメニューを追加
  - Community Detection
  - Centrality Analysis
  - Graph Statistics
  - Find Isolated Nodes
- 分析結果表示用のサイドパネル
- コミュニティ色分けのオン/オフ切り替え

## 受け入れ条件

- [ ] Louvain/Leidenアルゴリズムによるコミュニティ検出が動作する
- [ ] 検出結果がCytoscapeグラフ上に色分け表示される
- [ ] グラフ統計情報が正しく計算・表示される
- [ ] 孤立ノードの検出が機能する
- [ ] 単体テストが追加されている

## 関連Issue
- AI-2 (トークン最適化) — コミュニティ要約をLLM向け軽量フォーマットで出力
- AI-3 (GraphRAGデバッグ) — クレンジング済みグラフの構造分析に利用
- #88 グラフのフィルタリング/フォーカス機能 — コミュニティによるフィルタリングの基盤
