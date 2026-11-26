import { expect, loginAs, test } from './fixtures/app';

/* Runs against the shared demo backend (src/mocks): 12 seeded units of
   measure, 10 per page. No fixture file of its own. */

const TITLE = /^(Units of measure|وحدات القياس)$/;
const CODE_HEADER = /^(Code|الرمز)/;

test.describe('units of measure', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.backend();
    await loginAs(page, mockApi);
  });

  test('pages and sorts on the server, and the URL keeps the state', async ({
    page,
    dir,
  }) => {
    await page.goto('/units-of-measure');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(
      page.getByRole('heading', { level: 1, name: TITLE }),
    ).toBeVisible();
    const table = page.getByRole('table');
    await expect(table.getByText('PCS', { exact: true })).toBeVisible();
    // The display example follows the decimal places.
    await expect(table.getByText('12.346', { exact: true })).toBeVisible();

    await page
      .getByRole('columnheader', { name: CODE_HEADER })
      .getByRole('button')
      .click();
    await page
      .getByRole('columnheader', { name: CODE_HEADER })
      .getByRole('button')
      .click();
    await expect(page).toHaveURL(/sort=code\.desc/);
    await expect(table.getByText('TON', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: '2', exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await page.goBack();
    await expect(page).not.toHaveURL(/page=2/);
  });

  test('a filtered view survives a reload', async ({ page }) => {
    await page.goto('/units-of-measure');
    await page.getByRole('searchbox').fill('KG');
    await expect(page).toHaveURL(/q=KG/);
    const table = page.getByRole('table');
    await expect(table.getByText('PCS', { exact: true })).toBeHidden();
    await page.reload();
    await expect(table.getByText('KG', { exact: true })).toBeVisible();
    await expect(page.getByRole('searchbox')).toHaveValue('KG');
  });

  test('adds, edits and deletes a unit', async ({ page }) => {
    await page.goto('/units-of-measure');
    await page
      .getByRole('button', { name: /^(Create unit|إنشاء وحدة)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Code|الرمز)/).fill('lt');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('Litre');
    await dialog
      .getByRole('button', { name: /^(Save unit|حفظ الوحدة)$/ })
      .click();
    await expect(dialog).toBeHidden();

    await page.getByRole('searchbox').fill('LT');
    const row = page.getByRole('row').filter({ hasText: 'Litre' });
    await expect(row).toBeVisible();

    await row.getByRole('button', { name: /^(Edit|تعديل) / }).click();
    await expect(dialog.getByLabel(/^(Code|الرمز)/)).toHaveValue('LT');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('Litre two');
    await dialog
      .getByRole('button', { name: /^(Save unit|حفظ الوحدة)$/ })
      .click();
    await expect(row.getByText('Litre two')).toBeVisible();

    await row.getByRole('button', { name: /^(Delete|حذف) / }).click();
    const confirm = page.getByRole('alertdialog');
    await expect(
      confirm.getByRole('button', { name: /^(Cancel|إلغاء)$/ }),
    ).toBeFocused();
    await confirm.getByRole('button', { name: /^(Delete|حذف)$/ }).click();
    await expect(row).toHaveCount(0);
  });

  test('a backend field error shows under the input', async ({ page }) => {
    await page.goto('/units-of-measure');
    await page
      .getByRole('button', { name: /^(Create unit|إنشاء وحدة)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Code|الرمز)/).fill('pcs');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('Duplicate');
    await dialog
      .getByRole('button', { name: /^(Save unit|حفظ الوحدة)$/ })
      .click();
    await expect(
      dialog.getByText(/Unit code already exists|رمز الوحدة مستخدم مسبقاً/),
    ).toBeVisible();
  });
});
