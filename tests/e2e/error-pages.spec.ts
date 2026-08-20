import { test, expect } from '@playwright/test';

/**
 * Before this, both of these were Next.js defaults: an unstyled centred
 * "404: This page could not be found." and a bare "Application error", neither
 * carrying the site chrome or any way to continue.
 *
 * app/error.tsx and app/global-error.tsx cannot be exercised here without
 * shipping a route that deliberately throws. They were verified against a
 * temporary route during development: 500 status, our copy, a working "Try
 * again" control, and the Next digest surfaced as a traceable reference.
 */

test('an unknown URL returns 404 with the designed page', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/isn.t here/i);
  await expect(page.getByText(/404: This page could not be found/i)).toHaveCount(0);
});

test('the 404 carries site chrome and a way onward', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByRole('link', { name: /browse products/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /request a quote/i })).toBeVisible();
});

test('the 404 links every material directly', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  const main = page.locator('main');
  for (const slug of [
    'cat-litter',
    'leca',
    'silica-sand',
    'pebbles',
    'bleaching-earth',
    'soap-adsorbent',
  ]) {
    await expect(main.locator(`a[href="/products/${slug}"]`)).toHaveCount(1);
  }
});

test('the 404 is not indexable', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  const robots = await page.locator('meta[name="robots"]').first().getAttribute('content');
  expect(robots).toContain('noindex');
  // One directive only; declaring robots in metadata as well produced two
  // conflicting tags.
  await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
});
