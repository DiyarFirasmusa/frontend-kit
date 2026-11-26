import { expect, loginAs, test } from './fixtures/app';

const ERROR_PAGES = [
  {
    path: '/this-route-does-not-exist',
    title: /^(Item not found|العنصر غير موجود)$/,
  },
  { path: '/401', title: /^(Sign in required|تسجيل الدخول مطلوب)$/ },
  { path: '/403', title: /^(Access denied|الوصول مرفوض)$/ },
  {
    path: '/500',
    title: /^(The server ran into a problem|حدثت مشكلة في الخادم)$/,
  },
] as const;

test.describe('route guards', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.shell();
  });

  test('redirects a guest from the dashboard to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects a guest from a deep dashboard route to /login', async ({
    page,
  }) => {
    await page.goto('/suppliers');
    await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)suppliers$/);
  });

  test('returns to the deep route after signing in', async ({
    page,
    mockApi,
  }) => {
    await mockApi.login();
    await page.goto('/suppliers');
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await page.getByLabel(/^(username|اسم المستخدم)\s*\*?$/i).fill('admin');
    await page.getByLabel(/^(password|كلمة المرور)\s*\*?$/i).fill('secret');
    await page.getByRole('button', { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/\/suppliers$/);
  });

  test('ignores a redirect to another site', async ({ page, mockApi }) => {
    await mockApi.login();
    await page.goto('/login?redirect=%2F%2Fevil.example');
    await page.getByLabel(/^(username|اسم المستخدم)\s*\*?$/i).fill('admin');
    await page.getByLabel(/^(password|كلمة المرور)\s*\*?$/i).fill('secret');
    await page.getByRole('button', { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);
  });

  test('stays signed in after a reload, with no token in localStorage', async ({
    page,
    mockApi,
  }) => {
    await loginAs(page, mockApi);
    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('button', { name: /Ali Karkhi/i }),
    ).toBeVisible();
    const stored = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: sessionStorage.getItem('app-auth') ?? '',
    }));
    expect(stored.local).not.toContain('app-auth');
    expect(stored.local).not.toContain('app-permissions');
    expect(stored.session).not.toContain('accessToken');
  });

  test('redirects a signed-in user away from /login', async ({
    page,
    mockApi,
  }) => {
    await loginAs(page, mockApi);
    await page.goto('/login');
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('error pages', () => {
  for (const item of ERROR_PAGES) {
    test(`renders the heading for ${item.path}`, async ({ page }) => {
      await page.goto(item.path);
      await expect(
        page.getByRole('heading', { name: item.title }),
      ).toBeVisible();
    });
  }
});
