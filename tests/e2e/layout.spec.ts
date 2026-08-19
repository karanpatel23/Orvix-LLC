import { test, expect } from '@playwright/test';

/**
 * Guards the audit's strongest "generated site" signal: `min-h-[82vh]` sat on
 * both the hero and PageShell, so seven routes were pinned to exactly 738px at a
 * 900px viewport and six pages had byte-identical document heights of 1115px.
 * Page height must come from content, not from a viewport fraction.
 */

const ROUTES = [
  '/',
  '/about',
  '/products',
  '/products/silica-sand',
  '/products/cat-litter',
  '/products/leca',
  '/products/pebbles',
  '/products/bleaching-earth',
  '/products/soap-adsorbent',
  '/industries',
  '/export-trade',
  '/government-bulk-supply',
  '/contact',
];

/**
 * Trailing space below the last element of the first section. Legitimate values
 * are the section-pad bottom (96px) and the hero's deliberate 112px. The pinned
 * layout produced 178-241px of pure dead space.
 */
const MAX_SLACK = 130;

test('no route pads its first section beyond the designed rhythm', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: 'networkidle' });
    const slack = await page.evaluate(() => {
      const section = document.querySelector('main section') as HTMLElement;
      const children = Array.from(section.children) as HTMLElement[];
      const last = children[children.length - 1].getBoundingClientRect();
      const box = section.getBoundingClientRect();
      return Math.round(box.bottom - last.bottom);
    });
    expect(slack, `${route} has ${slack}px of trailing dead space`).toBeLessThanOrEqual(MAX_SLACK);
  }
});

test('page heights are driven by content, not a viewport fraction', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const heights = new Map<string, number>();
  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: 'networkidle' });
    heights.set(
      route,
      await page.evaluate(() => Math.round(document.documentElement.scrollHeight))
    );
  }

  // Pages with genuinely different amounts of content must differ in height.
  const distinct = new Set(heights.values());
  expect(
    distinct.size,
    `only ${distinct.size} distinct heights across ${ROUTES.length} routes`
  ).toBeGreaterThanOrEqual(ROUTES.length - 2);
});

test('no element is sized by a viewport-fraction min-height', async ({ page }) => {
  for (const route of ['/', '/about', '/products/silica-sand']) {
    await page.goto(route);
    const pinned = await page.evaluate(() => {
      const vh = window.innerHeight;
      return Array.from(document.querySelectorAll<HTMLElement>('main *'))
        .filter((el) => {
          const mh = getComputedStyle(el).minHeight;
          if (!mh || mh === '0px' || mh === 'auto') return false;
          const px = parseFloat(mh);
          // anything pinned to more than half the viewport is the old pattern
          return px > vh * 0.5;
        })
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60));
    });
    expect(pinned, `${route} pins elements to the viewport: ${pinned.join(', ')}`).toEqual([]);
  }
});

test('the footer stays at the bottom on a short page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1400 });
  await page.goto('/about', { waitUntil: 'networkidle' });

  const gap = await page.evaluate(() => {
    const footer = document.querySelector('footer')!.getBoundingClientRect();
    return Math.round(window.innerHeight - footer.bottom);
  });

  // Removing min-h could have left the footer floating mid-screen on a tall
  // viewport; the flex-column body prevents that.
  expect(gap, `footer floats ${gap}px above the viewport bottom`).toBeLessThanOrEqual(2);
});

/**
 * Guards a bug found while rebuilding the homepage sections: framer-motion's
 * `initial={{ opacity: 0 }}` is serialised into the server-rendered HTML, so the
 * hero headline and all six product cards shipped as `style="opacity:0"` and were
 * invisible whenever JavaScript did not run. A CSS `animation-timeline: view()`
 * replacement had the same failure in a different form, because scroll-linked
 * animations reverse when you scroll away.
 */
test.describe('content is never hidden by a reveal', () => {
  test('no server-rendered element ships with opacity:0', async ({ request }) => {
    for (const route of ['/', '/about', '/products']) {
      const html = await (await request.get(route)).text();
      expect(html, `${route} ships hidden inline styles`).not.toContain('opacity:0');
    }
  });

  test('nothing readable is transparent at any scroll position', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const route of ['/', '/about', '/products']) {
      await page.goto(route, { waitUntil: 'networkidle' });
      for (const fraction of [0, 0.5, 1, 0]) {
        await page.evaluate(
          (f) => window.scrollTo(0, document.body.scrollHeight * f),
          fraction
        );
        await page.waitForTimeout(120);
        const hidden = await page.evaluate(() =>
          Array.from(document.querySelectorAll<HTMLElement>('main *'))
            .filter(
              (el) =>
                el.children.length === 0 &&
                el.textContent?.trim() &&
                parseFloat(getComputedStyle(el).opacity) < 0.99
            )
            .map((el) => el.textContent!.trim().slice(0, 30))
        );
        expect(hidden, `${route} at scroll ${fraction}`).toEqual([]);
      }
    }
  });
});
