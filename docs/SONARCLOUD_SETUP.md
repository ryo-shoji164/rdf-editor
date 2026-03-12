# SonarCloud 著作権検証セットアップ

このドキュメントは、RDF Editor プロジェクトで SonarCloud を使用した著作権検証をセットアップする方法を説明します。

## 概要

SonarCloud は、GitHub と統合された無料のコード品質・セキュリティ分析プラットフォームです。このプロジェクトでは、SonarCloud を使用してコードの著作権ライセンス情報を検証しています。

## 前提条件

- GitHub アカウント
- このリポジトリへのアクセス権
- SonarCloud アカウント（GitHub でサインアップ可能）

## セットアップ手順

### Step 1: SonarCloud にサインアップ

1. [SonarCloud](https://sonarcloud.io) にアクセス
2. **"Sign up"** をクリック
3. **"Sign up with GitHub"** を選択
4. GitHub 認証を完了

### Step 2: プロジェクトをインポート

1. SonarCloud ダッシュボードにログイン
2. **"Create new project"** → **"Import project from GitHub"**
3. `ryo-shoji164/rdf-editor` を検索・選択
4. **"Set up"** をクリック
5. プロジェクトキーを確認：`ryo-shoji164_rdf-editor`

### Step 3: GitHub Secrets に SONAR_TOKEN を設定

1. SonarCloud の「Account Settings」→「Security」
2. **"Generate Token"** をクリック
3. トークンをコピー
4. GitHub リポジトリの **Settings** → **Secrets and variables** → **Actions**
5. **"New repository secret"** をクリック
6. 名前：`SONAR_TOKEN`、値：SonarCloud から生成したトークン
7. **"Add secret"** をクリック

### Step 4: 著作権検証ルールを有効化

1. SonarCloud ダッシュボード → プロジェクトを選択
2. **"Quality Profiles"** → **"TypeScript"**
3. 検索フィールドで「copyright」または「license」を検索
4. 関連ルール（例：`S1073 - Headers with line number`）を有効化
5. 設定を保存

## ワークフロー

### 自動スキャン

プッシュまたはプルリクエスト時に、以下が自動実行されます：

1. `.github/workflows/sonar.yml` が実行
2. 依存関係をインストール
3. ユニットテストを実行（カバレッジ計測）
4. SonarCloud がコードをスキャン
5. 著作権ライセンス検証を含むレポートが生成

### スキャン結果の確認

1. SonarCloud ダッシュボード → プロジェクト選択
2. **"Overview"** タブで品質メトリクスを確認
3. **"Issues"** タブで著作権に関する警告を確認

## 設定ファイル

### `sonar-project.properties`

プロジェクトのメタデータと著作権情報を定義：

```properties
sonar.projectKey=ryo-shoji164_rdf-editor
sonar.projectName=RDF Editor
sonar.copyrightNotice=Copyright (c) 2024-present ryo-shoji164
sonar.license=MIT
```

### `.github/workflows/sonar.yml`

GitHub Actions でスキャンを自動実行：

```yaml
- name: Run SonarCloud scan
  uses: SonarSource/sonarcloud-github-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## 著作権検証のカスタマイズ

### ファイルヘッダーの統一

（オプション）すべてのソースファイルに MIT ライセンスヘッダーを追加する場合：

```typescript
// Copyright (c) 2024-present ryo-shoji164
// Licensed under the MIT License. See LICENSE file in the project root.
```

### 除外ファイルの設定

以下のファイルは自動的に除外されます：

```properties
sonar.exclusions=node_modules/**,dist/**,coverage/**,**/*.test.ts,**/*.test.tsx
```

## トラブルシューティング

### `SONAR_TOKEN not found` エラー

**原因**: GitHub Secrets に `SONAR_TOKEN` が設定されていない

**解決策**:
1. GitHub リポジトリの Settings → Secrets を確認
2. `SONAR_TOKEN` が存在することを確認
3. ワークフロー実行時にトークンが有効か確認

### SonarCloud がプロジェクトを見つけない

**原因**: `sonar.projectKey` が SonarCloud のプロジェクトキーと一致していない

**解決策**:
1. SonarCloud ダッシュボードでプロジェクトキーを確認
2. `sonar-project.properties` を修正
3. ワークフロー再実行

### 著作権ルールが適用されない

**原因**: SonarCloud でルールが有効になっていない

**解決策**:
1. SonarCloud の Quality Profiles で「TypeScript」を確認
2. 著作権関連のルールを有効化
3. ルール設定を保存
4. ワークフロー再実行

## 参考リンク

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [SonarCloud GitHub Action](https://github.com/SonarSource/sonarcloud-github-action)
- [SonarCloud Quality Profiles](https://docs.sonarcloud.io/improving/quality-profiles/)
