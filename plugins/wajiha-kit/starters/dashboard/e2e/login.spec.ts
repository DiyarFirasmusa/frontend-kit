import { endpoints } from '../src/constants/api';
import { AUTH_BASE_URL, expect, loginAs, test } from './fixtures/app';

const EMAIL_LABEL = /^(username|اسم المستخدم)\s*\*?$/i;
const PASSWORD_LABEL = /^(password|كلمة المرور)\s*\*?$/i;
const SUBMIT_BUTTON = /sign in|تسجيل الدخول/i;
const USER_MENU = /Ali Karkhi/i;

test.describe('login', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.shell();
  });

  test('renders in the expected direction and theme', async ({
    page,
    dir,
    theme,
  }) => {
    await page.goto('/login');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    if (theme === 'dark') {
      await expect(page.locator('html')).toHaveClass(/dark/);
    } else {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    }
    await expect(
      page.getByRole('button', { name: SUBMIT_BUTTON }),
    ).toBeVisible();
  });

  test('sign-in form fills the available column width', async ({ page }) => {
    await page.goto('/login');

    const form = await page.locator('form').boundingBox();
    const usernameBox = await page.getByLabel(EMAIL_LABEL).boundingBox();
    const submitBox = await page
      .getByRole('button', { name: SUBMIT_BUTTON })
      .boundingBox();

    expect(form).not.toBeNull();
    expect(usernameBox).not.toBeNull();
    expect(submitBox).not.toBeNull();
    if (!form || !usernameBox || !submitBox) {
      return;
    }

    expect(Math.abs(usernameBox.width - form.width)).toBeLessThan(2);
    expect(Math.abs(submitBox.width - form.width)).toBeLessThan(2);
    expect(form.width).toBeGreaterThan(440);
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: SUBMIT_BUTTON }).click();
    await expect(
      page.getByText(/username is required|اسم المستخدم مطلوب/i),
    ).toBeVisible();
    await expect(
      page.getByText(/password is required|كلمة المرور مطلوبة/i),
    ).toBeVisible();
    await expect(page.getByLabel(EMAIL_LABEL)).toBeFocused();
  });

  test('rejects wrong credentials and stays on /login', async ({
    page,
    mockApi,
  }) => {
    await mockApi.login();
    await page.goto('/login');
    await page.getByLabel(EMAIL_LABEL).fill('admin');
    await page.getByLabel(PASSWORD_LABEL).fill('wrong');
    await page.getByRole('button', { name: SUBMIT_BUTTON }).click();

    const toast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toast).toHaveCount(1);
    await expect(toast).toHaveText(
      /No active account found with the given credentials/i,
    );
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(
      page.getByText(/to your work account|حساب العمل للمتابعة/i),
    ).toBeVisible();
  });

  test('signs in through the auth base and lands on the dashboard shell', async ({
    page,
    mockApi,
  }) => {
    const loginRequest = page.waitForRequest(
      (request) =>
        request.url() ===
          `${AUTH_BASE_URL}/${endpoints.auth.login.replace(/^\//, '')}` &&
        request.method() === 'POST',
    );
    await loginAs(page, mockApi);
    await loginRequest;
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: USER_MENU })).toBeVisible();
  });
});
