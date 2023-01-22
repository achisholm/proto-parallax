import { test, expect } from '@playwright/test';

test('meta is correct', async ({ page }) => {
    await page.goto("http://localhost:3000/basket");

    await expect(page).toHaveTitle('Basket | TLC Electrical');
});