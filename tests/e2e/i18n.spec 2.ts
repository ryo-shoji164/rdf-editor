import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for app to load initially
        await expect(page.getByRole('button', { name: /Editor|エディタ/i })).toBeVisible();
    });

    test('switches language between English and Japanese', async ({ page }) => {
        // Find the language toggle button. It should initially display "JA" when in English, or "EN" when in Japanese.
        // The default fallback is English, but browser language might be Japanese.
        const langToggle = page.getByTitle('Toggle Language');
        await expect(langToggle).toBeVisible();

        let initialLang = await langToggle.textContent();
        initialLang = initialLang?.trim() || '';

        if (initialLang === 'JA') {
            // Currently in English, should see "Editor"
            await expect(page.getByRole('button', { name: 'Editor', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Graph', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Table', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Split', exact: true })).toBeVisible();

            // Toggle to Japanese
            await langToggle.click();

            // Now we should see "エディタ" and the toggle should say "EN"
            await expect(page.getByRole('button', { name: 'エディタ', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'グラフ', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'テーブル', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: '分割表示', exact: true })).toBeVisible();

            await expect(langToggle).toHaveText('EN');

            // Toggle back to English
            await langToggle.click();
            await expect(page.getByRole('button', { name: 'Editor', exact: true })).toBeVisible();
            await expect(langToggle).toHaveText('JA');
        } else {
            // Currently in Japanese, should see "エディタ"
            await expect(page.getByRole('button', { name: 'エディタ', exact: true })).toBeVisible();

            // Toggle to English
            await langToggle.click();

            // Now we should see "Editor" and the toggle should say "JA"
            await expect(page.getByRole('button', { name: 'Editor', exact: true })).toBeVisible();
            await expect(langToggle).toHaveText('JA');

            // Toggle back to Japanese
            await langToggle.click();
            await expect(page.getByRole('button', { name: 'エディタ', exact: true })).toBeVisible();
            await expect(langToggle).toHaveText('EN');
        }
    });
});
