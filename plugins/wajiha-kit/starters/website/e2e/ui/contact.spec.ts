import { expect, test } from '../fixtures/app';

const TEXT = {
  ar: {
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    message: 'رسالتك',
    send: 'إرسال الرسالة',
    nameError: 'اكتب اسمك (حرفان على الأقل).',
    emailError: 'اكتب بريداً إلكترونياً صحيحاً، مثل name@example.com.',
    messageError: 'الرسالة قصيرة. اكتب 10 أحرف على الأقل.',
    success: 'وصلتنا رسالتك',
  },
  en: {
    name: 'Name',
    email: 'Email',
    message: 'Your message',
    send: 'Send message',
    nameError: 'Enter your name (at least 2 characters).',
    emailError: 'Enter a valid email address, for example name@example.com.',
    messageError: 'The message is too short. Write at least 10 characters.',
    success: 'We got your message',
  },
} as const;

test.describe('contact form', () => {
  test('empty submit shows an error under each field, in the page language', async ({
    page,
    localized,
    language,
  }) => {
    const text = TEXT[language];
    await page.goto(localized('/contact'));
    // Wait for hydration: the form handler is attached by React.
    await page.getByRole('button', { name: text.send }).click();

    await expect(page.getByText(text.nameError)).toBeVisible();
    await expect(page.getByText(text.emailError)).toBeVisible();
    await expect(page.getByText(text.messageError)).toBeVisible();
    await expect(page.getByLabel(text.name)).toHaveAttribute('aria-invalid', 'true');
  });

  test('a valid message goes through the server function and shows the success state', async ({
    page,
    localized,
    language,
  }) => {
    const text = TEXT[language];
    await page.goto(localized('/contact'));
    await page.getByLabel(text.name).fill('Sara Ali');
    await page.getByLabel(text.email).fill('sara@example.com');
    await page
      .getByLabel(text.message)
      .fill('Hello, I would like to ask about your training courses.');

    const request = page.waitForResponse(
      (response) => response.url().includes('_serverFn') && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: text.send }).click();
    expect((await request).status()).toBe(200);

    await expect(page.getByText(text.success)).toBeVisible();
  });

  test('the server function refuses a cross-site request (CSRF) and accepts a same-origin one', async ({
    page,
    request,
    localized,
    language,
  }) => {
    const text = TEXT[language];
    await page.goto(localized('/contact'));
    await page.getByLabel(text.name).fill('Sara Ali');
    await page.getByLabel(text.email).fill('sara@example.com');
    await page
      .getByLabel(text.message)
      .fill('Hello, I would like to ask about your training courses.');
    const sent = page.waitForRequest(
      (req) => req.url().includes('_serverFn') && req.method() === 'POST',
    );
    await page.getByRole('button', { name: text.send }).click();
    const original = await sent;

    const replay = (fetchSite: string) =>
      request.post(original.url(), {
        data: original.postData() ?? '',
        headers: {
          'content-type': original.headers()['content-type'] ?? 'application/json',
          'x-tsr-serverfn': 'true',
          'sec-fetch-site': fetchSite,
        },
      });
    expect((await replay('cross-site')).status()).toBe(403);
    expect((await replay('same-origin')).status()).toBe(200);
  });

  test('typing a bad email shows its error after leaving the field', async ({
    page,
    localized,
    language,
  }) => {
    const text = TEXT[language];
    await page.goto(localized('/contact'));
    await page.getByLabel(text.email).fill('not-an-email');
    await page.getByLabel(text.name).focus();
    await expect(page.getByText(text.emailError)).toBeVisible();
  });
});
