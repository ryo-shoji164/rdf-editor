---
title: "[AI-3] GraphRAGデバッグハブ: LLM自動抽出グラフのビジュアル検証・クレンジング機能"
labels: ["enhancement", "Phase 3: Enterprise", "integration"]
---

## 概要

LLMオーケストレーションフレームワーク（LangChain、LlamaIndex等）が非構造化テキストから自動抽出したナレッジグラフを **インポート・視覚化・検証・修正** するための統合ハブ機能を実装する。

## 背景・動機

LangChainの `LLMGraphTransformer` やLlamaIndexの `PropertyGraphIndex` は、PDF・ウェブページ等から自動的にエンティティと関係性を抽出する。しかし現実には:

- LLMが既存オントロジーと合致しない独自プロパティ名を生成する（スキーマ不整合）
- 同じ意味の異なる名前のエンティティを別ノードとして増殖させる（「Apple Inc.」と「Apple」）
- 確信度が低い関係性が大量に含まれる

これらの問題により、自動構築グラフをそのままプロダクション環境にデプロイするのはリスクが高く、**Human-in-the-Loop（人間の介在）** によるクレンジングが不可欠である。

## 実装内容

### 1. フレームワーク中間フォーマットのインポート

LLM抽出パイプラインの出力を直接読み込むコネクタ:

- **LangChain Graph Document JSON**: `{ "nodes": [...], "relationships": [...] }` 形式
- **LlamaIndex PropertyGraph JSON**: PropertyGraphIndexの出力形式
- **汎用 Edge List (CSV/JSON)**: `subject, predicate, object, confidence` 形式
- インポート時にN3.Storeへの自動変換とCytoscapeグラフへの展開

### 2. AI抽出結果の視覚的レビューUI

- **確信度ベースの色分け表示**: LLMの確信度（confidence score）に基づいてエッジを緑（高）→黄（中）→赤（低）でグラデーション表示
- **バッチ承認/棄却**: 確信度閾値を設定し、閾値以下のエッジを一括で棄却・保留する機能
- **スキーマ不整合の検出**: インポートされたプロパティ名が既存のドメインスキーマに存在しない場合にハイライト表示
- **マッピング提案**: 不整合なプロパティに対して、既存スキーマ内の類似プロパティを自動提案

### 3. Entity Resolution（名寄せ）の視覚的実行

- **類似ノード検出**: ラベルの文字列類似度（Levenshtein距離、Jaccard係数）に基づいて重複候補をグループ化
- **ドラッグ＆ドロップ結合**: 重複ノードをキャンバス上でドラッグ＆ドロップして統合
- **結合プレビュー**: 統合前に、統合後のノードのプロパティとエッジがどうなるかをプレビュー表示

### 4. クレンジング済みグラフのエクスポート

- 修正済みグラフを標準RDFフォーマット（Turtle/N-Triples/JSON-LD）でエクスポート
- Neo4j Cypherクエリとしてのエクスポート
- SPARQL INSERT DATAとしてのエクスポート

## ディレクトリ構造案

```
src/
├── lib/
│   ├── import/
│   │   ├── langchainImporter.ts   # LangChain Graph Document parser
│   │   ├── llamaindexImporter.ts  # LlamaIndex PropertyGraph parser
│   │   ├── edgeListImporter.ts    # 汎用 CSV/JSON edge list
│   │   └── confidenceMapper.ts    # 確信度→グラフスタイル変換
│   └── entityResolution/
│       ├── similarityScorer.ts    # 文字列類似度計算
│       └── mergeStrategy.ts       # ノード統合ロジック
├── components/
│   ├── import/
│   │   └── ImportDialog.tsx       # インポートダイアログ
│   └── graph/
│       └── EntityMergeDialog.tsx   # Entity Resolution UI
```

## 受け入れ条件

- [ ] LangChain Graph Document JSON形式のインポートが正常に動作する
- [ ] 確信度に基づくエッジの色分け表示が機能する
- [ ] 類似ノードの検出と統合操作が行える
- [ ] クレンジング後のグラフが正しくRDFエクスポートされる
- [ ] 単体テストが追加されている

## 関連Issue
- AI-1 (MCPサーバー) — AIエージェントがインポート・クレンジング操作をMCP経由で実行
- AI-2 (トークン最適化) — クレンジング済みグラフをLLM効率的な形式でエクスポート
