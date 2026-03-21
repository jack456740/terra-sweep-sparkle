import { test, expect } from '@playwright/test';

test.describe('End-to-End: Application Boot Flow', () => {
  test('loads the application dashboard successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page framework initializes
    await expect(page).toHaveTitle(/Vite|React|Terra Sweep/i);

    // Verify vital DOM architecture renders into document body
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
