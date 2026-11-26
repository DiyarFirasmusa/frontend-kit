import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures/app';

// A hard reload (or a link opened from a bookmark) of an admin page, with a session left in the tab. The
// route loaders start their requests before the admin layout has mounted, so a 401 can come back before
// anything listens for it. These tests load each URL cold and require the same outcome every time: the
// login page, with the "session ended" message and a way back. The mock user "expired" is the user whose
// token every API call answers 401 to.

const OLD_TOKEN = 'mock-token-expired-reload-test';
const USER = { id: 'user-expired', username: 'expired', name: 'expired' };
const RIGHTS = { roles: ['admin'], permissions: [] };

/** Puts a saved session in the tab's sessionStorage before the page's own scripts run. */
async function seedSession(page: Page, { version }: { version: number | undefined }) {
  await page.addInitScript(
    ({ user, token, rights, stored }) => {
      // Only on the first load: after the app erased it the test must see it stay erased.
      if (window.sessionStorage.getItem('admin-auth') !== null || window.name === 'seeded') {
        return;
      }
      window.name = 'seeded';
      const wrap = (state: unknown) =>
        JSON.stringify(stored === undefined ? { state } : { state, version: stored });
      window.sessionStorage.setItem('admin-auth', wrap({ user, accessToken: token }));
      window.sessionStorage.setItem('admin-permissions', wrap(rights));
    },
    { user: USER, token: OLD_TOKEN, rights: RIGHTS, stored: version },
  );
}

const URLS = ['/admin', '/admin/suppliers', '/admin/suppliers?page=2', '/admin/settings'];

test.describe('admin: a cold load with a session the server no longer accepts', () => {
  for (const path of URLS) {
    test(`${path} ends on the login page with the message, never on a dead page`, async ({
      page,
      localized,
      t,
    }) => {
      await seedSession(page, { version: 1 });
      await page.goto(localized(path));

      await expect(page.getByText(t('login.sessionEnded'))).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: t('login.title') })).toBeVisible();
      const url = new URL(page.url());
      expect(url.pathname).toBe(localized('/admin/login'));
      expect(url.searchParams.get('reason')).toBe('expired');
      expect(url.searchParams.get('redirect')).toBe(localized(path));

      // The token is gone from the tab, and no error panel from the page it never reached is left.
      const stored = await page.evaluate(() => JSON.stringify({ ...window.sessionStorage }));
      expect(stored).not.toContain(OLD_TOKEN);
      await expect(page.getByRole('button', { name: t('error.retry') })).toHaveCount(0);

      // And signing in again leads back to the page that was asked for.
      await page.getByRole('textbox', { name: t('login.username'), exact: true }).fill('demo');
      await page.getByRole('textbox', { name: t('login.password'), exact: true }).fill('any');
      await page.getByRole('button', { name: t('login.submit') }).click();
      await expect(page).toHaveURL(localized(path));
    });
  }
});

test.describe('admin: a session saved by an older version', () => {
  test('is erased with the old token: login page, no console error (the fixture fails on one)', async ({
    page,
    localized,
    t,
  }) => {
    await seedSession(page, { version: undefined });
    await page.goto(localized('/admin/suppliers'));
    await expect(page.getByRole('heading', { level: 1, name: t('login.title') })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(localized('/admin/login'));
    const stored = await page.evaluate(() => JSON.stringify({ ...window.sessionStorage }));
    expect(stored).not.toContain(OLD_TOKEN);
  });
});

test.describe('admin: focus after sign-out', () => {
  test('lands on the login page heading, not on <body>', async ({ page, open, t }) => {
    await open('/admin');
    await page.getByRole('textbox', { name: t('login.username'), exact: true }).fill('demo');
    await page.getByRole('textbox', { name: t('login.password'), exact: true }).fill('any');
    await page.getByRole('button', { name: t('login.submit') }).click();
    await page.getByRole('button', { name: t('admin.accountMenu') }).click();
    await page.getByRole('menuitem', { name: t('admin.signOut') }).click();
    const heading = page.getByRole('heading', { level: 1, name: t('login.title') });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
  });
});
