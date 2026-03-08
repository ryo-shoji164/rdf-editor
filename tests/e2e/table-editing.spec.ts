import { test, expect } from '@playwright/test';

test.describe('Table Inline Editing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        // Wait for editor to load
        await expect(page.locator('.monaco-editor')).toBeVisible();

        // Switch to Table view
        const tableButton = page.getByRole('button', { name: /Table|テーブル/i });
        await tableButton.click();

        // Ensure table is loaded and shows default FOAF triples.
        // Note: http://example.org/alice is shortened to "alice" by the formatRdfTerm logic since it has no prefix.
        await expect(page.getByText('alice', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('foaf:name', { exact: true }).first()).toBeVisible();
        await expect(page.getByText(/"Alice"/)).toBeVisible();
    });

    test('should allow editing an object literal via double click', async ({ page }) => {
        // Double click the object cell "Alice"
        const objectCell = page.getByRole('cell', { name: /"Alice"/ });
        await objectCell.dblclick();

        // An input should appear. Type new value and press Enter.
        const input = page.locator('td input[type="text"]');
        await expect(input).toBeVisible();
        await expect(input).toHaveValue('Alice');

        await input.fill('Alice Liddell');
        await input.press('Enter');

        // Input should disappear, new value should be displayed
        await expect(input).not.toBeVisible();
        await expect(page.getByText(/"Alice Liddell"/)).toBeVisible();

        // Switch back to editor to verify it got synced
        const editorButton = page.getByRole('button', { name: /Editor|エディタ/i });
        await editorButton.click();

        // Use evaluate to get the actual Monaco model value
        const editorText = await page.evaluate(() => {
            // @ts-ignore
            return window.monaco.editor.getModels()[0].getValue();
        });
        expect(editorText).toContain('"Alice Liddell"');
        expect(editorText).not.toContain('"Alice" ;');
    });

    test('should allow editing a subject IRI via double click', async ({ page }) => {
        // Find the cell with alice (first occurrence)
        const subjectCell = page.getByText('alice', { exact: true }).first();
        await subjectCell.dblclick();

        const input = page.locator('td input[type="text"]');
        // Let's change it to http://example.org/alicia
        await input.fill('http://example.org/alicia');

        // Test blur save by clicking another cell
        await page.getByText('foaf:name', { exact: true }).first().click();

        await expect(input).not.toBeVisible();
        // It will be shortened to alicia
        await expect(page.getByText('alicia', { exact: true }).first()).toBeVisible();
    });

    test('should cancel editing on Escape', async ({ page }) => {
        const predicateCell = page.getByText('foaf:name', { exact: true }).first();
        await predicateCell.dblclick();

        const input = page.locator('td input[type="text"]');
        await input.fill('foaf:givenName');
        await input.press('Escape');

        // Should revert to old value
        await expect(input).not.toBeVisible();
        await expect(page.getByText('foaf:name', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('foaf:givenName')).not.toBeVisible();
    });
});
