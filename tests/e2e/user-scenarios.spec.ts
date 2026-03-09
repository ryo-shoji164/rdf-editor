import { test, expect } from '@playwright/test';

test.describe('ユーザーシナリオ自動テスト', () => {

    test('シナリオ1: オントロジーエンジニア（直接編集とリアルタイム反映）', async ({ page }) => {
        await page.goto('/');

        // Wait for editor to load
        await expect(page.locator('.monaco-editor')).toBeVisible();

        // 1. エディタに新しいTurtleを入力
        await page.evaluate(() => {
            // @ts-ignore
            window.monaco.editor.getModels()[0].setValue('@prefix ex: <http://example.org/> .\n@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n\nex:Bob a foaf:Person ;\n  foaf:name "Bob" .');
        });

        // 400ms のデバウンスを待つ
        await page.waitForTimeout(600);

        // 2つのトリプルとしてパースされているか確認
        await expect(page.locator('text=2 triples')).toBeVisible();

        // 2. 意図的にエラーを発生させる（末尾のピリオドを消す）
        await page.evaluate(() => {
            // @ts-ignore
            window.monaco.editor.getModels()[0].setValue('@prefix ex: <http://example.org/> .\n@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n\nex:Bob a foaf:Person ;\n  foaf:name "Bob" ');
        });
        await page.waitForTimeout(600);

        // GUI上にエラーメッセージが出力されるか確認（⚠アイコン）
        await expect(page.getByText(/⚠/)).toBeVisible();
    });

    test('シナリオ2: ドメインエキスパート（GUIを介したノード・エッジの追加）', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.monaco-editor')).toBeVisible();
        await page.getByRole('button', { name: /Graph|グラフ/i }).click();

        // Cytoscapeコンテナが表示されるのを待つ
        await expect(page.getByTestId('cytoscape-container')).toBeVisible();

        // 1. ノードを追加
        await page.getByRole('button', { name: 'Add Node' }).click();
        await page.getByPlaceholder(/http:\/\/example\.org\/MyNode/).fill('http://example.org/Alice');
        await page.getByRole('dialog').getByRole('button', { name: 'Add Node', exact: true }).click();

        // デフォルト(FOAF例)は12トリプル。ノード追加で1トリプル追加され13になる
        await expect(page.locator('text=13 triples')).toBeVisible();

        // Cytoscapeのアニメーション等のため少し待つ
        await page.waitForTimeout(500);

        // 非選択状態にするためキャンバスの背景をクリック
        const canvas = page.getByTestId('cytoscape-container').locator('canvas').last();
        await canvas.click({ force: true, position: { x: 15, y: 15 } });

        // 2. エッジを追加
        await page.getByRole('button', { name: 'Add Edge' }).click();
        const subjectInput = page.getByPlaceholder(/http:\/\/example\.org\/SubjectNode/);
        await expect(subjectInput).toBeVisible();

        await subjectInput.fill('http://example.org/Alice');
        await page.getByPlaceholder(/http:\/\/example\.org\/knows/).fill('http://xmlns.com/foaf/0.1/knows');
        await page.getByPlaceholder(/http:\/\/example\.org\/Person/).fill('http://example.org/Bob');
        await page.getByRole('dialog').getByRole('button', { name: 'Add Edge', exact: true }).click();

        // エッジ追加でさらに1トリプル増え14になる
        await expect(page.locator('text=14 triples')).toBeVisible();
    });

    test('シナリオ3: SAMMモデラー（SAMMテンプレートの適用）', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.monaco-editor')).toBeVisible();

        // Examplesメニューから「SAMM Aspect」テンプレートを選択
        await page.getByRole('button', { name: /Examples/i }).hover();
        await page.getByRole('button', { name: /SAMM Aspect/i }).click();

        // テンプレート反映後のトリプル数を確認 (大体21〜22の範囲内になる)
        await expect(page.locator('text=/Triples:\\s*(21|22)/i')).toBeVisible();

        // エディタに SAMM のプレフィックス (urn:samm:) が含まれているか確認
        const editorText = await page.evaluate(() => {
            // @ts-ignore
            return window.monaco.editor.getModels()[0].getValue();
        });
        expect(editorText).toContain('urn:samm:');
    });
});
