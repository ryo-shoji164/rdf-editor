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

    test('adds a new node via the toolbar Add Node button', async ({ page }) => {
        // Wait for cytoscape container
        await expect(page.getByTestId('cytoscape-container')).toBeVisible();

        // Click the Add Node button in the toolbar
        const toolbarAddNodeBtn = page.getByRole('button', { name: 'Add Node' });
        await expect(toolbarAddNodeBtn).toBeVisible();
        await toolbarAddNodeBtn.click();

        // The Add Node dialog should appear
        const dialogHeading = page.getByRole('heading', { name: 'Add New Node' });
        await expect(dialogHeading).toBeVisible();

        // Fill out the dialog for toolbar addition
        const iriInput = page.getByPlaceholder(/http:\/\/example\.org\/MyNode/);
        await iriInput.fill('http://example.org/ToolbarNode');

        const addButton = page.getByRole('button', { name: 'Add Node', exact: true });
        await addButton.click();

        // Dialog should close and we added 1 type triple = 13 total
        await expect(dialogHeading).not.toBeVisible();
        await expect(page.locator('text=13 triples')).toBeVisible();
    });

    test('adds a new edge via the toolbar Add Edge button with manual subject', async ({ page }) => {
        await expect(page.getByTestId('cytoscape-container')).toBeVisible();

        // Ensure no node is selected by clicking the background
        const canvas = page.getByTestId('cytoscape-container').locator('canvas').last();
        await canvas.click({ force: true, position: { x: 15, y: 15 } });

        // Click the Add Edge button in the toolbar
        const toolbarAddEdgeBtn = page.getByRole('button', { name: 'Add Edge' });
        await expect(toolbarAddEdgeBtn).toBeVisible();
        await toolbarAddEdgeBtn.click();

        // The Add Edge dialog should appear
        const dialogHeading = page.getByRole('heading', { name: 'Add New Edge' });
        await expect(dialogHeading).toBeVisible();

        // Fill out the dialog 
        // 1. Manual Subject Input (because sourceNodeId was null)
        const subjectInput = page.getByPlaceholder(/http:\/\/example\.org\/SubjectNode/);
        await expect(subjectInput).toBeVisible();
        await subjectInput.fill('http://example.org/PersonA');

        // 2. Predicate Input
        const predicateInput = page.getByPlaceholder(/http:\/\/example\.org\/knows/);
        await predicateInput.fill('http://xmlns.com/foaf/0.1/knows');

        // 3. Object Input
        const objectInput = page.getByPlaceholder(/http:\/\/example\.org\/Person/);
        await objectInput.fill('http://example.org/PersonB');

        const addButton = page.getByRole('button', { name: 'Add Edge', exact: true });
        await addButton.click();

        // Dialog should close and we added 1 edge triple = 13 total
        await expect(dialogHeading).not.toBeVisible();
        await expect(page.locator('text=13 triples')).toBeVisible();
    });
});
