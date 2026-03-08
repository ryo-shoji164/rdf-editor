import { test, expect } from '@playwright/test';

test.describe('Editor Synchronization', () => {
    test('loads the app and renders core layouts', async ({ page }) => {
        await page.goto('/');

        // Verify header exists
        await expect(page.getByText('RDF Editor')).toBeVisible();

        // Verify tabs exist
        await expect(page.getByRole('button', { name: /Editor/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Graph/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Table/i })).toBeVisible();
    });

    test('switches template and updates views', async ({ page }) => {
        await page.goto('/');

        // Wait for initial parse to finish (we might see 12 triples for FOAF)
        await expect(page.locator('text=/Triples:/i')).toBeVisible();

        // Hover over Examples menu
        await page.getByRole('button', { name: /Examples/i }).hover();
        // Click some SAMM template option
        await page.getByRole('button', { name: /SAMM Aspect/i }).click();

        // The triple count should update
        await expect(page.locator('text=/Triples:\\s*(21|22)/i')).toBeVisible();
    });
});
