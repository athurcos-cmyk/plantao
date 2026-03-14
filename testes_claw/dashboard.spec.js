import { test, expect } from '@playwright/test';

test.describe('2. DASHBOARD', () => {
  test('Acesso sem login redireciona', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Seu código pessoal')).toBeVisible({ timeout: 5000 });
  });
});
