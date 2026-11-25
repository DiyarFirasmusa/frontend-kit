import { expect, loginAs, test } from './fixtures/app';
import { mockUnitsOfMeasure } from './fixtures/units-of-measure';

test.describe('units of measure', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.shell();
    await mockUnitsOfMeasure(mockApi);
    await loginAs(page, mockApi);
  });

  test('lists units with their decimal display example', async ({
    page,
    dir,
  }) => {
    await page.goto('/units-of-measure');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Units of measure|وحدات القياس/,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole('cell', { name: 'PCS', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'KG', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('12.346', { exact: true })).toBeVisible();
  });

  test('creates a unit through the form dialog', async ({ page }) => {
    let created: unknown;
    await page.route('**/api/units-of-measure', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      created = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        json: {
          id: 'uom-4',
          code: 'BOX',
          name: 'Box',
          decimalPlaces: 0,
          isActive: true,
        },
      });
    });

    await page.goto('/units-of-measure');
    await page
      .getByRole('button', { name: /^(Create unit|إنشاء وحدة)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/^(Name|الاسم)/).fill('Box');
    await dialog.getByLabel(/^(Code|الرمز)/).fill('box');
    await dialog
      .getByRole('button', { name: /^(Save unit|حفظ الوحدة)$/ })
      .click();

    await expect
      .poll(() => created)
      .toEqual({ code: 'BOX', name: 'Box', decimalPlaces: 0, isActive: true });
    await expect(dialog).toBeHidden();
  });
});
