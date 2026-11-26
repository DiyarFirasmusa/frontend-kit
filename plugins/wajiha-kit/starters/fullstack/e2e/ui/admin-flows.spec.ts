import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures/app';

// The admin's less happy paths, on the mock API (VITE_ADMIN_API_MOCK=true in the e2e build). The mock has
// four demo users: any name (administrator), "viewer" (read only: writes answer 403), "expired" (every
// request after sign-in answers 401) and "blocked" (the login itself answers 401).

type T = (key: string) => string;

async function signIn(page: Page, t: T, username = 'demo'): Promise<void> {
  await expect(page.getByRole('heading', { level: 1, name: t('login.title') })).toBeVisible();
  await page.getByRole('textbox', { name: t('login.username'), exact: true }).fill(username);
  await page.getByRole('textbox', { name: t('login.password'), exact: true }).fill('any-password');
  await page.getByRole('button', { name: t('login.submit') }).click();
}

/** Signs in and waits until the admin has opened (a reload before that would cancel the login). */
async function signInAndWait(page: Page, t: T, username = 'demo'): Promise<void> {
  await signIn(page, t, username);
  await expect(page.getByRole('button', { name: t('admin.accountMenu') })).toBeVisible();
}

async function axeBlocking(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return results.violations
    .filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
    .map((violation) => ({
      rule: violation.id,
      nodes: violation.nodes.map((node) => node.target.join(' ')),
    }));
}

/** A translation key shown as text ("admin.notFoundTitle") means a bundle was not loaded. */
const RAW_KEY = /\b(admin|error|login|common)\.[a-zA-Z]+\b/u;

test.describe('admin: unknown URLs', () => {
  test('an unknown admin page is a localized 404 with a main landmark and noindex', async ({
    page,
    open,
    t,
  }) => {
    const response = await open('/admin/does-not-exist');
    expect(response?.status()).toBe(404);
    const main = page.locator('main');
    await expect(main).toHaveCount(1);
    await expect(main.getByRole('heading', { level: 1 })).toHaveText(t('error.notFoundTitle'));
    await expect(main).toContainText(t('error.notFoundText'));
    await expect(page.locator('body')).not.toContainText(RAW_KEY);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/u);
    await expect(page).toHaveTitle(t('error.notFoundTitle'));
    expect(await axeBlocking(page)).toEqual([]);
    // The way back works (to the login page when signed out).
    await main.getByRole('link', { name: t('error.backToAdmin') }).click();
    await expect(page.getByRole('heading', { level: 1, name: t('login.title') })).toBeVisible();
  });

  test('a wrong language in front of admin is a 404 page, not an empty admin', async ({ page }) => {
    for (const path of ['/fr/admin', '/xx/admin/login']) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
      await expect(page.locator('main'), path).toHaveCount(1);
      await expect(page.locator('main h1'), path).toBeVisible();
      await expect(page.locator('body'), path).not.toContainText(RAW_KEY);
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute(
        'content',
        /noindex/u,
      );
    }
  });
});

test.describe('admin: session and access', () => {
  test('a session that ends sends the user to login with a message, and back to the page afterwards', async ({
    page,
    open,
    localized,
    t,
  }) => {
    await open('/admin/suppliers?page=2');
    await expect(page).toHaveURL(new RegExp(`${localized('/admin/login')}\\?redirect=`));
    // "expired" signs in fine, then the API answers 401 to everything.
    await signIn(page, t, 'expired');
    await expect(page.getByText(t('login.sessionEnded'))).toBeVisible();

    // The way back is the page the user was on: one level of redirect, not a login URL inside a login URL.
    const url = new URL(page.url());
    expect(url.pathname).toBe(localized('/admin/login'));
    expect(url.searchParams.get('reason')).toBe('expired');
    expect(url.searchParams.get('redirect')).toBe(`${localized('/admin/suppliers')}?page=2`);

    await signIn(page, t, 'demo');
    await expect(page).toHaveURL(`${localized('/admin/suppliers')}?page=2`);
    await expect(page.getByRole('cell', { name: 'SUP-011', exact: true })).toBeVisible();
  });

  test('a failed login stays on the login page and says why', async ({
    page,
    open,
    localized,
    t,
  }) => {
    await open('/admin/login');
    await signIn(page, t, 'blocked');
    await expect(page.getByRole('alert').filter({ hasText: /\S/u })).toBeVisible();
    await expect(page).toHaveURL(localized('/admin/login'));
    await expect(page.getByRole('heading', { level: 1, name: t('login.title') })).toBeVisible();
    // Nothing was stored: the admin is still closed.
    await page.goto(localized('/admin'));
    await expect(page).toHaveURL(new RegExp(`${localized('/admin/login')}`));
  });

  test('empty login fields show the field errors and send nothing', async ({ page, open, t }) => {
    await open('/admin/login');
    await page.getByRole('button', { name: t('login.submit') }).click();
    await expect(page.getByText(t('login.usernameRequired'))).toBeVisible();
    await expect(page.getByText(t('login.passwordRequired'))).toBeVisible();
  });

  test('sign out sends the session token to the server', async ({
    page,
    open,
    localized,
    t,
    isMobile,
  }) => {
    test.skip(isMobile, 'the account menu is the same on phones; one run is enough');
    await open('/admin/login');
    await signIn(page, t);
    await expect(page).toHaveURL(localized('/admin'));
    const logout = page.waitForRequest((request) => request.url().endsWith('/api/auth/logout'));
    await page.getByRole('button', { name: t('admin.accountMenu') }).click();
    await page.getByRole('menuitem', { name: t('admin.signOut') }).click();
    const request = await logout;
    expect(await request.headerValue('authorization')).toMatch(/^Bearer mock-token-admin-/u);
    // A plain sign-out is not an expired session: no message, no login URL inside the login URL.
    await expect(page).toHaveURL(localized('/admin/login'));
    await expect(page.getByText(t('login.sessionEnded'))).toHaveCount(0);
  });

  test('the no-access page opens for a signed-in user and leads back', async ({
    page,
    open,
    localized,
    t,
  }) => {
    await open('/admin/login');
    await signInAndWait(page, t, 'viewer');
    await page.goto(localized('/admin/forbidden'));
    const main = page.locator('#admin-main');
    await expect(
      main.getByRole('heading', { level: 1, name: t('admin.forbiddenTitle') }),
    ).toBeVisible();
    await expect(main).toContainText(t('admin.forbiddenText'));
    await main.getByRole('link', { name: t('admin.backToOverview') }).click();
    await expect(page).toHaveURL(localized('/admin'));
  });

  test('a read-only user with a tampered screen gets a 403 from the server and the UI shows it', async ({
    page,
    open,
    localized,
    t,
  }) => {
    await open('/admin/login');
    await signInAndWait(page, t, 'viewer');
    // Hiding buttons is cosmetic: give the screen the administrator's rights and try a change anyway.
    await page.evaluate(() => {
      sessionStorage.setItem(
        'admin-permissions',
        JSON.stringify({ state: { roles: ['admin'], permissions: [] }, version: 1 }),
      );
    });
    await page.goto(localized('/admin/suppliers'));
    await page.getByRole('button', { name: t('suppliers.create') }).click();
    const dialog = page.getByRole('dialog');
    await dialog
      .getByRole('textbox', { name: t('suppliers.fieldCode'), exact: true })
      .fill('HACK-1');
    await dialog
      .getByRole('textbox', { name: t('suppliers.fieldName'), exact: true })
      .fill('Not allowed');
    await dialog.getByRole('button', { name: t('ui.save') }).click();
    // One error toast with the API's own message; the dialog stays open and nothing was created.
    // (CSS selector: while a modal dialog is open the rest of the page is aria-hidden for role queries.)
    await expect(page.locator('[role="alert"]').filter({ hasText: /\S/u })).toHaveCount(1);
    await expect(dialog).toBeVisible();
    await expect(page.getByText(t('suppliers.created'))).toHaveCount(0);
  });

  test('a page past the last one lands on the last page', async ({ page, open, localized, t }) => {
    await open('/admin/suppliers?page=99');
    await signIn(page, t);
    await expect(page).toHaveURL(`${localized('/admin/suppliers')}?page=3`);
    await expect(page.getByRole('cell', { name: 'SUP-021', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '3', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

test.describe('admin: language and navigation', () => {
  test('switching language keeps the page, the filters and the session', async ({
    page,
    open,
    localized,
    t,
    language,
  }) => {
    const other = language === 'ar' ? 'en' : 'ar';
    await open('/admin/login');
    await signInAndWait(page, t);
    await page.goto(localized('/admin/suppliers?status=inactive'));
    await expect(page.getByRole('heading', { level: 1, name: t('suppliers.title') })).toBeVisible();
    const switcher = page.getByRole('link', { name: t('common.switchLanguage') });
    await expect(switcher).toHaveAttribute('href', `/${other}/admin/suppliers?status=inactive`);
    await switcher.click();
    await expect(page).toHaveURL(`/${other}/admin/suppliers?status=inactive`);
    await expect(page.locator('html')).toHaveAttribute('lang', other);
    // Still signed in and still filtered.
    await expect(page.getByRole('cell', { name: 'SUP-004', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'SUP-001', exact: true })).toHaveCount(0);
  });

  test('switching language on the login page keeps where the user wanted to go', async ({
    page,
    open,
    localized,
    t,
    language,
  }) => {
    const other = language === 'ar' ? 'en' : 'ar';
    await open('/admin/suppliers?page=2');
    await expect(page).toHaveURL(new RegExp(`${localized('/admin/login')}\\?redirect=`));
    await page.getByRole('link', { name: t('common.switchLanguage') }).click();
    await expect(page).toHaveURL(new RegExp(`/${other}/admin/login\\?redirect=`));
    await expect(page.locator('html')).toHaveAttribute('lang', other);
    // Sign in in the other language: the page the user asked for opens, in that language.
    await page.locator('input[autocomplete="username"]').fill('demo');
    await page.locator('input[type="password"]').fill('any-password');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(`/${other}/admin/suppliers?page=2`);
  });

  test('every admin page has its own title, and a page change moves focus to its heading', async ({
    page,
    open,
    localized,
    t,
    isMobile,
  }) => {
    await open('/admin/login');
    await signInAndWait(page, t);
    const titles = new Set<string>();
    for (const [path, key] of [
      ['/admin', 'overview.title'],
      ['/admin/suppliers', 'suppliers.title'],
      ['/admin/settings', 'settings.title'],
    ] as const) {
      await page.goto(localized(path));
      await expect(page.getByRole('heading', { level: 1, name: t(key) })).toBeVisible();
      await expect(page).toHaveTitle(`${t(key)} | ${t('admin.title')}`);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(3);

    // Client-side navigation: focus lands on the new page's heading and it is announced.
    test.skip(isMobile, 'the sidebar is a menu sheet on phones; the announcer is the same code');
    await page.goto(localized('/admin'));
    await expect(page.getByRole('heading', { level: 1, name: t('overview.title') })).toBeVisible();
    await page
      .getByRole('navigation', { name: t('admin.navLabel') })
      .getByRole('link', { name: t('admin.navSettings') })
      .click();
    await expect(page.getByRole('heading', { level: 1, name: t('settings.title') })).toBeFocused();
    await expect(page.locator('output.sr-only')).toHaveText(t('settings.title'));
    await expect(page).toHaveTitle(`${t('settings.title')} | ${t('admin.title')}`);
  });

  test('opening a select raises no CSP violation (the console guard fails the test otherwise)', async ({
    page,
    open,
    t,
  }) => {
    await open('/admin/suppliers');
    await signIn(page, t);
    await expect(page.getByRole('cell', { name: 'SUP-001', exact: true })).toBeVisible();
    await page.getByRole('combobox', { name: t('suppliers.filterStatus') }).click();
    await expect(page.getByRole('option', { name: t('ui.inactive') })).toBeVisible();
    await page.keyboard.press('Escape');
  });
});
