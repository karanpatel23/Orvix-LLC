import { test, expect } from '@playwright/test';

/**
 * Guards the most expensive bug the audit found: the root layout declared
 * `alternates: { canonical: '/' }`, which every route inherited, so all 13 pages
 * told search engines they were duplicates of the homepage.
 */

const ROUTES = [
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

test('no route canonicalises to the homepage', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical, `${route} has no canonical`).toBeTruthy();
    expect(canonical, `${route} canonicalises to the homepage`).not.toMatch(/orvixllc\.com\/?$/);
    expect(canonical).toContain(route);
  }
});

test('every route has a unique title and description', async ({ page }) => {
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();

  for (const route of ROUTES) {
    await page.goto(route);
    const title = await page.title();
    const description =
      (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';

    expect(title, `${route} has no title`).toBeTruthy();
    expect(description, `${route} has no description`).toBeTruthy();

    const titleClash = [...titles.entries()].find(([, t]) => t === title);
    expect(titleClash, `${route} shares its title with ${titleClash?.[0]}`).toBeUndefined();
    const descClash = [...descriptions.entries()].find(([, d]) => d === description);
    expect(descClash, `${route} shares its description with ${descClash?.[0]}`).toBeUndefined();

    titles.set(route, title);
    descriptions.set(route, description);
  }
});

test('routes expose Open Graph tags for link previews', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(1);
  }
});

test('sitemap lists every indexable route', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const xml = await response.text();
  for (const route of ROUTES) {
    expect(xml, `sitemap is missing ${route}`).toContain(route);
  }
});
