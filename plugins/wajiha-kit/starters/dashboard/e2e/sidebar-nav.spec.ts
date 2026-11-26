import { expect, loginAs, test } from './fixtures/app';

/**
 * Sidebar accordion spec.
 *
 * Asserts:
 * - Every group header is a button with aria-expanded, collapsed on "/".
 * - Opening one group collapses the other (one open at a time).
 * - The group containing the active route opens automatically on load.
 * - The mobile sheet renders the same accordion without horizontal overflow.
 *
 * Runs automatically in all four projects: ar/en x light/dark.
 */

const NAV_LANDMARK = /^(Main navigation|القائمة الرئيسية)$/i;
const GROUP_BUTTONS = {
  products: /^(Products|المواد)$/,
  warehouses: /^(Warehouses|المستودعات)$/,
} as const;
const SUPPLIERS = /^(Suppliers|الموردون)$/;
const UNITS_OF_MEASURE = /^(Units of measure|وحدات القياس)$/;
const OPEN_NAV = /^(open navigation menu|فتح قائمة التنقل)$/i;

test.describe('sidebar accordion', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.shell();
    await loginAs(page, mockApi);
    await expect(
      page.getByRole('navigation', { name: NAV_LANDMARK }),
    ).toBeVisible();
  });

  test('every group header is collapsed on the dashboard', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: NAV_LANDMARK });
    for (const name of Object.values(GROUP_BUTTONS)) {
      await expect(nav.getByRole('button', { name })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    }
  });

  test('opening one group collapses the other', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: NAV_LANDMARK });
    const products = nav.getByRole('button', { name: GROUP_BUTTONS.products });
    const warehouses = nav.getByRole('button', {
      name: GROUP_BUTTONS.warehouses,
    });

    await products.click();
    await expect(products).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link', { name: SUPPLIERS })).toBeVisible();

    await warehouses.click();
    await expect(warehouses).toHaveAttribute('aria-expanded', 'true');
    await expect(products).toHaveAttribute('aria-expanded', 'false');
  });

  test('the group containing the active route opens automatically', async ({
    page,
  }) => {
    await page.goto('/units-of-measure');
    const nav = page.getByRole('navigation', { name: NAV_LANDMARK });
    await expect(
      nav.getByRole('button', { name: GROUP_BUTTONS.products }),
    ).toHaveAttribute('aria-expanded', 'true');

    const link = nav.getByRole('link', { name: UNITS_OF_MEASURE });
    await expect(link).toHaveAttribute('aria-current', 'page');
  });

  test('sidebar does not overflow horizontally', async ({ page }) => {
    const [scrollWidth, clientWidth] = await page
      .locator('aside')
      .evaluate((el) => [el.scrollWidth, el.clientWidth]);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('mobile sheet renders the accordion and does not overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page
      .locator('header[data-slot="topbar"]')
      .getByRole('button', { name: OPEN_NAV })
      .click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: GROUP_BUTTONS.products }),
    ).toHaveAttribute('aria-expanded', 'false');

    const [scrollWidth, clientWidth] = await dialog.evaluate((el) => [
      el.scrollWidth,
      el.clientWidth,
    ]);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
