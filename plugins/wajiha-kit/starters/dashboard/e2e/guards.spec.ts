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
    await expect(page).toHaveURL(/\/login$/);
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
