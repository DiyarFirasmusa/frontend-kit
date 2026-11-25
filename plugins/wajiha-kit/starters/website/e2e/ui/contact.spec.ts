import type { Page } from '@playwright/test';
import { expect, test, WEBHOOK_FAIL_MARKER } from '../fixtures/app';

const MESSAGE = 'Hello, I would like to ask about your training courses.';

async function fillValid(page: Page, t: (key: string) => string, message = MESSAGE) {
  await page.getByLabel(t('contact.nameLabel')).fill('Sara Ali');
  await page.getByLabel(t('contact.emailLabel')).fill('sara@example.com');
  await page.getByLabel(t('contact.messageLabel')).fill(message);
}

const isServerFnPost = (url: string, method: string) =>
  url.includes('_serverFn') && method === 'POST';

test.describe('contact form', () => {
  test('empty submit shows an error under each field, in the page language', async ({
    page,
    open,
    t,
  }) => {
    await open('/contact');
    await page.getByRole('button', { name: t('contact.submit') }).click();

    await expect(page.getByText(t('contact.nameRequired'))).toBeVisible();
    await expect(page.getByText(t('contact.emailInvalid'))).toBeVisible();
    await expect(page.getByText(t('contact.messageTooShort'))).toBeVisible();
    await expect(page.getByLabel(t('contact.nameLabel'))).toHaveAttribute('aria-invalid', 'true');
  });

  test('a valid message is delivered and focus moves to the success heading', async ({
    page,
    open,
    t,
  }) => {
    await open('/contact');
    await fillValid(page, t);
    // Arabic phone keyboards type Arabic-Indic digits: they must pass, not show the phone error.
    await page.getByLabel(t('contact.phoneLabel')).fill('٠٧٧٠١٢٣٤٥٦٧');

    const request = page.waitForResponse((response) =>
      isServerFnPost(response.url(), response.request().method()),
    );
    await page.getByRole('button', { name: t('contact.submit') }).click();
    expect((await request).status()).toBe(200);

    const success = page.getByRole('heading', { name: t('contact.successTitle') });
    await expect(success).toBeVisible();
    await expect(success).toBeFocused();
  });

  test('a delivery failure shows a real error, keeps the text, and a retry clears it', async ({
    page,
    open,
    t,
  }) => {
    test.skip(Boolean(process.env.E2E_BASE_URL), 'needs the local webhook receiver');
    await open('/contact');
    await fillValid(page, t, `${MESSAGE} ${WEBHOOK_FAIL_MARKER}`);
    await page.getByRole('button', { name: t('contact.submit') }).click();

    const error = page.getByText(t('contact.serverError'));
    await expect(error).toBeVisible();
    await expect(page.getByLabel(t('contact.nameLabel'))).toHaveValue('Sara Ali');

    await page.getByLabel(t('contact.messageLabel')).fill(MESSAGE);
    await page.getByRole('button', { name: t('contact.submit') }).click();
    await expect(page.getByRole('heading', { name: t('contact.successTitle') })).toBeVisible();
    await expect(error).toBeHidden();
  });

  test('the server function refuses a cross-site request (CSRF) and accepts a same-origin one', async ({
    page,
    request,
    open,
    t,
  }) => {
    await open('/contact');
    await fillValid(page, t);
    const sent = page.waitForRequest((req) => isServerFnPost(req.url(), req.method()));
    await page.getByRole('button', { name: t('contact.submit') }).click();
    const original = await sent;
    const body = original.postData() ?? '';

    const replay = (fetchSite: string, data = body) =>
      request.post(original.url(), {
        data,
        headers: {
          'content-type': original.headers()['content-type'] ?? 'application/json',
          'x-tsr-serverfn': 'true',
          'sec-fetch-site': fetchSite,
        },
      });
    expect((await replay('cross-site')).status()).toBe(403);
    expect((await replay('same-origin')).status()).toBe(200);

    // Input the browser form would never send gets a plain "not ok", without validation details.
    const invalid = await replay('same-origin', body.replace('sara@example.com', 'not-an-email'));
    const answer = await invalid.text();
    expect(answer).not.toContain('emailInvalid');
    expect(answer).not.toMatch(/zod|issues/i);
  });

  test('typing a bad email shows its error after leaving the field', async ({ page, open, t }) => {
    await open('/contact');
    await page.getByLabel(t('contact.emailLabel')).fill('not-an-email');
    await page.getByLabel(t('contact.nameLabel')).focus();
    await expect(page.getByText(t('contact.emailInvalid'))).toBeVisible();
  });
});
