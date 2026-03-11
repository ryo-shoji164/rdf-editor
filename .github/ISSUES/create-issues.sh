#!/bin/bash
# =============================================================================
# GitHub Issue一括作成スクリプト
#
# 使い方:
#   1. GitHub CLIが認証済みであることを確認: gh auth status
#   2. リポジトリのルートで実行: bash .github/ISSUES/create-issues.sh
#
# 前提条件:
#   - gh (GitHub CLI) がインストール・認証済み
#   - リポジトリのルートディレクトリから実行
# =============================================================================

set -euo pipefail

REPO="ryo-shoji164/rdf-editor"
ISSUES_DIR=".github/ISSUES"

create_issue() {
  local file="$1"

  # Extract title from frontmatter
  local title=$(grep '^title:' "$file" | sed 's/^title: *"//' | sed 's/"$//')

  # Extract labels from frontmatter
  local labels=$(grep '^labels:' "$file" | sed 's/^labels: *//' | tr -d '[]"' | tr ',' '\n' | sed 's/^ *//' | paste -sd ',' -)

  # Extract body (everything after the second ---)
  local body=$(awk '/^---$/{n++} n>=2{if(n==2 && /^---$/){n++; next}; print}' "$file")

  echo "Creating issue: $title"
  echo "  Labels: $labels"

  if [ -n "$labels" ]; then
    gh issue create \
      --repo "$REPO" \
      --title "$title" \
      --body "$body" \
      --label "$labels"
  else
    gh issue create \
      --repo "$REPO" \
      --title "$title" \
      --body "$body"
  fi

  echo "  ✓ Created successfully"
  echo ""
  sleep 1  # Rate limiting
}

echo "========================================="
echo "  RDF Editor AI Strategy - Issue Creator"
echo "========================================="
echo ""

# Process files in order
for file in \
  "$ISSUES_DIR/AI-8_ai-settings-panel.md" \
  "$ISSUES_DIR/AI-2_token-optimized-serialization.md" \
  "$ISSUES_DIR/AI-7_graphrag-templates.md" \
  "$ISSUES_DIR/AI-6_community-detection.md" \
  "$ISSUES_DIR/AI-1_mcp-server.md" \
  "$ISSUES_DIR/AI-3_graphrag-debug-hub.md" \
  "$ISSUES_DIR/AI-4_intelligent-suggest.md" \
  "$ISSUES_DIR/AI-5_nl-schema-generation.md" \
  "$ISSUES_DIR/AI-9_oss-positioning.md" \
; do
  if [ -f "$file" ]; then
    create_issue "$file"
  else
    echo "WARNING: File not found: $file"
  fi
done

echo "========================================="
echo "  All issues created successfully!"
echo "========================================="
