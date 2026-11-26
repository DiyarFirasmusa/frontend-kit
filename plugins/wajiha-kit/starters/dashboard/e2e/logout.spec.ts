import { expect, loginAs, test } from './fixtures/app';

const USER_MENU = /Ali Karkhi/i;
const SIGN_OUT_ITEM = /^(Sign out|تسجيل الخروج)$/i;
const SIGN_IN_BUTTON = /sign in|تسجيل الدخول/i;

test.describe('logout', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.shell();
  });

  test('clears the session and returns the user to /login', async ({
    page,
    mockApi,
  }) => {
    await loginAs(page, mockApi);

    await page.getByRole('button', { name: USER_MENU }).click();
    await page.getByRole('menuitem', { name: SIGN_OUT_ITEM }).click();

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(
      page.getByRole('button', { name: SIGN_IN_BUTTON }),
    ).toBeVisible();

    await page.goto('/');
    await expect(page).toHaveURL(/\/login\/?$/);

    const storage = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: sessionStorage.getItem('app-auth'),
    }));
    // Tokens never touch localStorage; the sessionStorage copy is emptied.
    expect(storage.local).not.toContain('app-auth');
    expect(storage.local).not.toContain('app-permissions');
    const authState = storage.session
      ? (JSON.parse(storage.session) as {
          state: { refreshToken: string | null; user: unknown };
        })
      : null;
    expect(authState?.state.refreshToken ?? null).toBeNull();
    expect(authState?.state.user ?? null).toBeNull();
    expect(storage.session ?? '').not.toContain('accessToken');

    await page.goBack({ waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/login\/?$/);
  });
});
