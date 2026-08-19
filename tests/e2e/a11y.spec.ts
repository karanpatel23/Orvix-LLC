import { test, expect } from '@playwright/test';

const MOBILE = { width: 375, height: 812 };

test.describe('mobile menu', () => {
  test.use({ viewport: MOBILE });

  test('toggle announces its state via aria-expanded', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /open menu/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(page.getByRole('button', { name: /close menu/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  test('toggle points at the panel it controls', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /open menu/i });
    const controls = await toggle.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    await toggle.click();
    await expect(page.locator('[data-nav-panel]')).toBeVisible();
    await expect(page.locator('[data-nav-panel]')).toHaveAttribute('id', controls!);
  });

  test('Escape closes the menu and returns focus to the toggle', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open menu/i }).click();
    await expect(page.getByRole('button', { name: /close menu/i })).toBeVisible();

    await page.keyboard.press('Escape');

    const toggle = page.getByRole('button', { name: /open menu/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('clicking outside closes the menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open menu/i }).click();
    await expect(page.getByRole('button', { name: /close menu/i })).toBeVisible();

    // Well below the fixed header, which intercepts pointer events near the top.
    await page.locator('main').click({ position: { x: 30, y: 640 } });

    await expect(page.getByRole('button', { name: /open menu/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('focus is trapped inside the open panel', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /open menu/i });
    const controls = await toggle.getAttribute('aria-controls');
    await toggle.click();

    const panel = page.locator('[data-nav-panel]');
    const links = panel.getByRole('link');
    const count = await links.count();
    expect(count).toBeGreaterThan(1);

    // Tab through every link; focus must never escape the panel.
    for (let i = 0; i < count + 2; i += 1) {
      const inside = await page.evaluate(() => {
        const el = document.querySelector('[data-nav-panel]');
        return el ? el.contains(document.activeElement) : false;
      });
      expect(inside, `focus left the panel after ${i} tabs`).toBe(true);
      await page.keyboard.press('Tab');
    }
  });

  test('menu toggle meets the 44px minimum tap target', async ({ page }) => {
    await page.goto('/');
    const box = await page.getByRole('button', { name: /open menu/i }).boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('navigation state', () => {
  test('the current page is marked aria-current', async ({ page }) => {
    for (const route of ['/about', '/products', '/contact']) {
      await page.goto(route);
      const current = page.getByRole('banner').locator('[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute('href', route);
    }
  });

  test('a product detail page marks its parent nav item current', async ({ page }) => {
    await page.goto('/products/silica-sand');
    const current = page.getByRole('banner').locator('[aria-current="page"]');
    await expect(current).toHaveAttribute('href', '/products');
  });
});

test.describe('document structure', () => {
  const ROUTES = [
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

  test('no route skips a heading level', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const levels = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) =>
          Number(h.tagName[1])
        )
      );
      expect(levels[0], `${route} does not start at h1`).toBe(1);
      for (let i = 1; i < levels.length; i += 1) {
        expect(
          levels[i] - levels[i - 1],
          `${route} jumps from h${levels[i - 1]} to h${levels[i]}`
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  test('skip-to-content link is the first tab stop and reaches main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveText(/skip to content/i);
    await expect(focused).toHaveAttribute('href', '#main');
    await expect(page.locator('#main')).toHaveCount(1);
  });
});
