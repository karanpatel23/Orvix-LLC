import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/about',
  '/products',
  '/products/cat-litter',
  '/products/leca',
  '/products/silica-sand',
  '/products/pebbles',
  '/products/bleaching-earth',
  '/products/soap-adsorbent',
  '/industries',
  '/export-trade',
  '/government-bulk-supply',
  '/contact',
];

// PageShell renders its own <header> inside the page, so `locator('header')`
// is ambiguous. Landmark roles address the site chrome unambiguously.
for (const route of routes) {
  test(`${route} renders chrome and exactly one h1`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
  });
}

test('legacy product URL redirects to the current one', async ({ page }) => {
  await page.goto('/products/bleaching-earth-soap-adsorbent');
  await expect(page).toHaveURL(/\/products\/bleaching-earth$/);
});

test('request quote CTA routes to contact', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /request a quote/i }).first().click();
  await expect(page).toHaveURL(/\/contact/);
});
