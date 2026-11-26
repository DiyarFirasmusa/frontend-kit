import { AxeBuilder } from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { expect, test } from '../fixtures/app';

// The admin runs on the mock API (VITE_ADMIN_API_MOCK=true in the e2e build): any login works, the user
// name "viewer" is read-only, and the data resets with every page load, so the tests never share state.

type T = (key: string) => string;

async function signIn(page: Page, t: T, username = 'demo'): Promise<void> {
  await expect(page.getByRole('heading', { level: 1, name: t('login.title') })).toBeVisible();
  await page.getByRole('textbox', { name: t('login.username'), exact: true }).fill(username);
  await page.getByRole('textbox', { name: t('login.password'), exact: true }).fill('any-password');
  await page.getByRole('button', { name: t('login.submit') }).click();
}

/** Row buttons are icons on wide screens and a "..." menu on phones. */
async function rowAction(page: Page, row: Locator, t: T, label: string, isMobile: boolean) {
  if (isMobile) {
    await row.getByRole('button', { name: t('ui.actions') }).click();
    await page.getByRole('menuitem', { name: label }).click();
  } else {
    await row.getByRole('button', { name: label }).click();
  }
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

test.describe('admin', () => {
  test('sends a visitor to login, then to the page they asked for', async ({
    page,
    open,
    localized,
    t,
  }) => {
    await open('/admin/suppliers');
    await expect(page).toHaveURL(new RegExp(`${localized('/admin/login')}\\?redirect=`));
    await signIn(page, t);
    await expect(page).toHaveURL(localized('/admin/suppliers'));
    await expect(page.getByRole('heading', { level: 1, name: t('suppliers.title') })).toBeVisible();
  });

  test('login leads to the overview with its numbers', async ({ page, open, localized, t }) => {
    await open('/admin');
    await signIn(page, t);
    await expect(page).toHaveURL(localized('/admin'));
    await expect(page.getByRole('heading', { level: 1, name: t('overview.title') })).toBeVisible();
    const main = page.locator('#admin-main');
    await expect(main.getByText(t('overview.totalSuppliers'), { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: t('overview.recentTitle') })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', localized('/').slice(1));
  });

  test('suppliers: create, find, edit and delete', async ({
    page,
    open,
    localized,
    t,
    isMobile,
  }) => {
    await open('/admin/suppliers');
    await signIn(page, t);
    await expect(page).toHaveURL(localized('/admin/suppliers'));
    await expect(page.getByRole('heading', { level: 1, name: t('suppliers.title') })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'SUP-001', exact: true })).toBeVisible();

    // Create
    await page.getByRole('button', { name: t('suppliers.create') }).click();
    const dialog = page.getByRole('dialog');
    await dialog
      .getByRole('textbox', { name: t('suppliers.fieldCode'), exact: true })
      .fill('E2E-100');
    await dialog
      .getByRole('textbox', { name: t('suppliers.fieldName'), exact: true })
      .fill('E2E Supplier');
    await dialog.getByRole('button', { name: t('ui.save') }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(t('suppliers.created'))).toBeVisible();

    // Find it: the search goes into the URL
    await page.getByRole('searchbox').fill('E2E-100');
    await expect(page).toHaveURL(/[?&]q=E2E-100/u);
    const row = page.getByRole('row').filter({ hasText: 'E2E-100' });
    await expect(row).toHaveCount(1);
    await expect(page.getByRole('cell', { name: 'SUP-001', exact: true })).toBeHidden();

    // Edit
    await rowAction(page, row, t, t('suppliers.edit'), isMobile);
    await dialog
      .getByRole('textbox', { name: t('suppliers.fieldName'), exact: true })
      .fill('E2E Supplier Renamed');
    await dialog.getByRole('button', { name: t('ui.save') }).click();
    await expect(dialog).toBeHidden();
    await expect(row).toContainText('E2E Supplier Renamed');

    // Delete, with confirm
    await rowAction(page, row, t, t('suppliers.delete'), isMobile);
    const confirm = page.getByRole('alertdialog').or(page.getByRole('dialog'));
    await expect(confirm).toContainText('E2E Supplier Renamed');
    await confirm.getByRole('button', { name: t('suppliers.delete') }).click();
    await expect(page.getByText(t('suppliers.emptyFiltered'))).toBeVisible();
  });

  test('suppliers: paging and the status filter live in the URL', async ({
    page,
    open,
    localized,
    t,
  }) => {
    await open('/admin/suppliers?status=inactive');
    await signIn(page, t);
    await expect(page).toHaveURL(`${localized('/admin/suppliers')}?status=inactive`);
    await expect(
      page.getByRole('cell', { name: t('ui.inactive'), exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: t('ui.active'), exact: true })).toHaveCount(0);

    await page.goto(localized('/admin/suppliers?page=2'));
    await expect(page.getByRole('cell', { name: 'SUP-011', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '2', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('a read-only user sees no create, edit or delete', async ({ page, open, t }) => {
    await open('/admin/suppliers');
    await signIn(page, t, 'viewer');
    await expect(page.getByRole('cell', { name: 'SUP-001', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: t('suppliers.create') })).toHaveCount(0);
    await expect(page.getByRole('button', { name: t('suppliers.edit') })).toHaveCount(0);
    await expect(page.getByRole('button', { name: t('ui.actions') })).toHaveCount(0);
  });

  test('settings: the profile form saves and renames the user', async ({
    page,
    open,
    localized,
    t,
  }) => {
    await open('/admin/settings');
    await signIn(page, t);
    await expect(page).toHaveURL(localized('/admin/settings'));
    const name = page.getByRole('textbox', { name: t('settings.name'), exact: true });
    await expect(name).toHaveValue('demo');
    await name.fill('Demo Person');
    await page.getByRole('button', { name: t('ui.save') }).click();
    await expect(page.getByText(t('settings.saved'))).toBeVisible();
    await expect(page.getByRole('button', { name: t('admin.accountMenu') })).toContainText(
      'Demo Person',
    );
  });

  test('sign out ends the session', async ({ page, open, localized, t, isMobile }) => {
    test.skip(isMobile, 'the account menu is the same on phones; one run is enough');
    await open('/admin/login');
    await signIn(page, t);
    await page.getByRole('button', { name: t('admin.accountMenu') }).click();
    await page.getByRole('menuitem', { name: t('admin.signOut') }).click();
    await expect(page).toHaveURL(localized('/admin/login'));
    await page.goto(localized('/admin'));
    await expect(page).toHaveURL(new RegExp(`${localized('/admin/login')}`));
  });

  test('the phone menu opens the admin pages', async ({ page, open, localized, t, isMobile }) => {
    test.skip(!isMobile, 'phone only');
    await open('/admin/login');
    await signIn(page, t);
    await page.getByRole('button', { name: t('admin.openMenu') }).click();
    await page
      .getByRole('dialog')
      .getByRole('link', { name: t('admin.navSuppliers') })
      .click();
    await expect(page).toHaveURL(localized('/admin/suppliers'));
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('login, overview, suppliers and settings pass axe', async ({ page, open, localized, t }) => {
    await open('/admin/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await axeBlocking(page)).toEqual([]);
    await signIn(page, t);
    for (const path of ['/admin', '/admin/suppliers', '/admin/settings']) {
      await page.goto(localized(path));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      expect(await axeBlocking(page), path).toEqual([]);
    }
  });
});
