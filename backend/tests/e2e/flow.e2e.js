const { test, expect } = require('@playwright/test');

test('E2E: Should show error for invalid login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'fake@user.com');
  await page.fill('input[name="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*Error=true/);
});
