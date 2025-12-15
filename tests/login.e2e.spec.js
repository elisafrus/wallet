const { test, expect } = require('@playwright/test');

test('Повний цикл: Реєстрація -> Вхід -> Перевірка homepage', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');
  await page.fill('input[name="fullname"]', 'Test User E2E');
  await page.fill('input[name="email"]', 'e2e_test@mail.com');
  await page.fill('input[name="password"]', 'testpass123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*\/login/);

  await page.fill('input[name="email"]', 'e2e_test@mail.com');
  await page.fill('input[name="password"]', 'testpass123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*\/homepage/);

  const welcomeMessage = page.locator('h1');
  await expect(welcomeMessage).toContainText('Welcome to your wallet');

  await expect(page.locator('#income-form')).toBeVisible();
});
