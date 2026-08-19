import { test, expect } from '@playwright/test';

test('mobile nav opens and exposes the primary links', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: /open menu/i }).click();
  // Scope to the banner: /products is also linked from the hero and the footer.
  await expect(page.getByRole('banner').getByRole('link', { name: 'Products', exact: true })).toBeVisible();
});

test('contact route rejects non-POST with 405', async ({ request }) => {
  const response = await request.get('/api/contact');
  expect(response.status()).toBe(405);
  expect(response.headers()['allow']).toBe('POST');
});

test('contact API rejects an invalid payload with per-field errors', async ({ request }) => {
  const response = await request.post('/api/contact', {
    data: { fullName: '', email: 'not-an-email' },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.ok).toBe(false);
  expect(body.errors).toBeTruthy();
});

test('contact API rejects malformed JSON with 400, not 500', async ({ request }) => {
  const response = await request.post('/api/contact', {
    headers: { 'Content-Type': 'application/json' },
    data: '{not valid json',
  });
  expect(response.status()).toBe(400);
});

test('security headers are present on a page response', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['content-security-policy']).toContain("default-src 'self'");
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
});
