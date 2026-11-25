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
      auth: localStorage.getItem('app-auth'),
      perms: localStorage.getItem('app-permissions'),
    }));
    const authState = storage.auth
      ? (JSON.parse(storage.auth) as {
          state: { accessToken: string | null; refreshToken: string | null };
        })
      : null;
    expect(authState?.state.accessToken ?? null).toBeFalsy();
    expect(authState?.state.refreshToken ?? null).toBeFalsy();
    const permsState = storage.perms
      ? (JSON.parse(storage.perms) as {
          state: { roles: string[]; permissions: string[] };
        })
      : null;
    expect(permsState?.state.roles ?? []).toEqual([]);
    expect(permsState?.state.permissions ?? []).toEqual([]);

    await page.goBack({ waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/login\/?$/);
  });
});
