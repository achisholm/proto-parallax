import { test, expect } from '@playwright/test';

test('meta is correct', async ({ page }) => {
    await page.goto("/basket");

    await expect(page).toHaveTitle('Basket | TLC Electrical');
});