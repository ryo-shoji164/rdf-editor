import { test, expect } from '@playwright/test'

test.describe('Onboarding Tutorial', () => {
    test.beforeEach(async ({ page }) => {
        // Ensure localStorage is clear to trigger tutorial
        await page.goto('/')
        await page.evaluate(() => localStorage.removeItem('rdf-editor-onboarding-complete'))
        await page.reload()
    })

    test('should show tutorial on first visit and allow navigation', async ({ page }) => {
        // Welcome step
        await expect(page.getByText('Welcome to RDF Editor!')).toBeVisible()

        // Click Next
        await page.getByRole('button', { name: 'Next' }).click()

        // Toolbar step
        await expect(page.getByText('The toolbar contains global actions')).toBeVisible()

        // Skip tutorial
        await page.getByRole('button', { name: 'Skip' }).click()

        // Tutorial should be gone
        await expect(page.getByText('Welcome to RDF Editor!')).not.toBeVisible()

        // Refresh and ensure it doesn't show up again
        await page.reload()
        await expect(page.getByText('Welcome to RDF Editor!')).not.toBeVisible()
    })

    test('should re-trigger tutorial via help button', async ({ page }) => {
        // Skip initial tutorial
        await page.getByRole('button', { name: 'Skip' }).click()

        // Click Help button
        await page.locator('#joyride-help').click()

        // Tutorial should start again
        await expect(page.getByText('Welcome to RDF Editor!')).toBeVisible()

        // Complete tutorial
        while (await page.getByRole('button', { name: 'Next' }).isVisible()) {
            await page.getByRole('button', { name: 'Next' }).click()
        }
        await page.getByRole('button', { name: 'Done' }).click()

        // Tutorial should be gone
        await expect(page.getByText('Welcome to RDF Editor!')).not.toBeVisible()
    })
})
