import { test, expect } from '@playwright/test';

const fill = {
  'Full name': 'QA Buyer',
  'Company name': 'ORVIX QA',
  Email: 'qa@example.com',
  Phone: '+1 555 0100',
  'Quantity / expected volume': '10 MT',
  'Destination country': 'United States',
  Message: 'Please share options for silica sand mesh ranges and packaging.',
};

async function fillForm(page: import('@playwright/test').Page) {
  for (const [label, value] of Object.entries(fill)) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
}

test.describe('quote request flow', () => {
  test('submits and reaches a terminal state - never stuck on Sending', async ({ page }) => {
    await page.goto('/contact');
    await fillForm(page);

    const submit = page.getByRole('button', { name: /submit request/i });
    await submit.click();

    // The previous implementation could strand the button on "Sending…" forever.
    // Whatever the outcome, the form must reach a terminal state.
    await expect
      .poll(async () => (await submit.count()) === 0 || !(await submit.isDisabled()), {
        timeout: 15_000,
        message: 'form never left the submitting state',
      })
      .toBe(true);
  });

  test('reports delivery failure honestly instead of faking success', async ({ page }) => {
    // Force a server-side failure so we assert the error path specifically.
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          message: 'We could not submit your request automatically. Please email info@orvixllc.com directly.',
        }),
      })
    );

    await page.goto('/contact');
    await fillForm(page);
    await page.getByRole('button', { name: /submit request/i }).click();

    // Scope to the form: Next injects its own role="alert" route announcer.
    const alert = page.locator('form').getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('info@orvixllc.com');
    // Critically: it must NOT claim success.
    await expect(alert).not.toContainText(/thank you/i);
  });

  test('surfaces a network failure rather than hanging', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.abort('failed'));

    await page.goto('/contact');
    await fillForm(page);
    await page.getByRole('button', { name: /submit request/i }).click();

    await expect(page.locator('form').getByRole('alert')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /submit request/i })).toBeEnabled();
  });

  test('shows per-field errors returned by the server', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          message: 'Please correct the highlighted fields and try again.',
          errors: { email: 'Enter a valid email address.' },
        }),
      })
    );

    await page.goto('/contact');
    await fillForm(page);
    await page.getByRole('button', { name: /submit request/i }).click();

    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  });

  test('confirms success and offers to send another', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, message: 'Thank you. Your request has been received.' }),
      })
    );

    await page.goto('/contact');
    await fillForm(page);
    await page.getByRole('button', { name: /submit request/i }).click();

    await expect(page.getByText('Request received')).toBeVisible();
    await expect(page.getByRole('button', { name: /send another request/i })).toBeVisible();
  });
});
