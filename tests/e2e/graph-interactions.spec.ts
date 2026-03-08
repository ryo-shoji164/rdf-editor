import { test, expect } from '@playwright/test';

test.describe('Graph Interactions - Context Menu', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for app to load initially
        await expect(page.getByRole('button', { name: /Editor/i })).toBeVisible();
    });

    test('adds a new node via background right-click', async ({ page }) => {
        // Wait for cytoscape container to be visible
        const cyContainer = page.getByTestId('cytoscape-container');
        await expect(cyContainer).toBeVisible();

        // Wait for cytoscape to fully initialize and animate layout
        await page.waitForTimeout(1000);

        // Right-click in the top-left corner of the cytoscape top canvas
        // This avoids randomly hitting a node rendered by the dynamic layout algorithm.
        const canvas = cyContainer.locator('canvas').last();
        await canvas.click({ button: 'right', force: true, position: { x: 15, y: 15 } });

        // The context menu should appear
        const addNodeMenuItem = page.getByRole('button', { name: 'Add Node...' });
        await expect(addNodeMenuItem).toBeVisible();
        await addNodeMenuItem.click();

        // The Add Node dialog should appear
        const dialogHeading = page.getByRole('heading', { name: 'Add New Node' });
        await expect(dialogHeading).toBeVisible();

        // Fill out the dialog
        const iriInput = page.getByPlaceholder(/http:\/\/example\.org\/MyNode/);
        await iriInput.fill('http://example.org/TestNode');

        const labelInput = page.getByPlaceholder(/Human readable display name/);
        await labelInput.fill('A Test Node');

        // Submit
        const addButton = page.getByRole('button', { name: 'Add Node', exact: true });
        await addButton.click();

        // The dialog should close
        await expect(dialogHeading).not.toBeVisible();

        // Verifying exact text in Monaco Editor is flaky due to syntax highlighting spans.
        // Instead, verify that the triple count increased
        // The default FOAF example has 12 triples. We added a type and a label, so it should be 14.
        await expect(page.locator('text=14 triples')).toBeVisible();
    });
});
