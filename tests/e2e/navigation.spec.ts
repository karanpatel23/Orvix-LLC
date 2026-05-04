import { test, expect } from '@playwright/test';

test('mobile nav opens/closes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: /toggle menu/i }).click();
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
});

test('contact fallback message appears', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Full name').fill('Test User');
  await page.getByLabel('Company name').fill('ORVIX QA');
  await page.getByLabel('Email').fill('qa@example.com');
  await page.getByLabel('Phone').fill('+1 555 0100');
  await page.getByLabel('Quantity / expected volume').fill('10 MT');
  await page.getByLabel('Destination country').fill('United States');
  await page.getByLabel('Message').fill('Please share options for silica sand mesh ranges and packaging.');
  await page.getByRole('button', { name: /submit request/i }).click();
  await expect(page.getByRole('status')).toContainText(/Email delivery is not configured yet|Thank you\./);
});
