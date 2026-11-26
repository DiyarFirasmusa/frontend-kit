import { expect, loginAs, test } from './fixtures/app';

/* Runs against the shared demo backend (src/mocks): 25 seeded suppliers,
   SUP-001 to SUP-025, 10 per page. No fixture file of its own. */

const TITLE = /^(Suppliers|الموردون)$/;
const CODE_HEADER = /^(Code|الرمز)/;

test.describe('suppliers', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.backend();
    await loginAs(page, mockApi);
  });

  test('pages and sorts on the server, and the URL keeps the state', async ({
    page,
    dir,
  }) => {
    await page.goto('/suppliers');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(
      page.getByRole('heading', { level: 1, name: TITLE }),
    ).toBeVisible();
    const table = page.getByRole('table');
    await expect(table.getByText('SUP-001', { exact: true })).toBeVisible();

    await page
      .getByRole('columnheader', { name: CODE_HEADER })
      .getByRole('button')
      .click();
    await expect(page).toHaveURL(/sort=code\.asc/);
    await page
      .getByRole('columnheader', { name: CODE_HEADER })
      .getByRole('button')
      .click();
    await expect(page).toHaveURL(/sort=code\.desc/);
    await expect(table.getByText('SUP-025', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: '2', exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(table.getByText('SUP-015', { exact: true })).toBeVisible();

    await page.goBack();
    await expect(page).not.toHaveURL(/page=2/);
    await expect(table.getByText('SUP-025', { exact: true })).toBeVisible();
  });

  test('a filtered view survives a reload', async ({ page }) => {
    await page.goto('/suppliers');
    await page.getByRole('searchbox').fill('SUP-002');
    await expect(page).toHaveURL(/q=SUP-002/);
    const table = page.getByRole('table');
    await expect(table.getByText('SUP-001', { exact: true })).toBeHidden();
    await page.reload();
    await expect(table.getByText('SUP-002', { exact: true })).toBeVisible();
    await expect(page.getByRole('searchbox')).toHaveValue('SUP-002');
  });

  test('adds, edits and deletes a supplier', async ({ page }) => {
    await page.goto('/suppliers');
    await page
      .getByRole('button', { name: /^(Add supplier|إضافة مورد)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Code|الرمز)/).fill('SUP-900');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('Demo Trading');
    await dialog
      .getByRole('button', { name: /^(Save supplier|حفظ المورد)$/ })
      .click();
    await expect(dialog).toBeHidden();

    await page.getByRole('searchbox').fill('SUP-900');
    const row = page.getByRole('row').filter({ hasText: 'SUP-900' });
    await expect(row).toBeVisible();

    await row.getByRole('button', { name: /^(Edit|تعديل) / }).click();
    await expect(dialog.getByLabel(/^(Code|الرمز)/)).toHaveValue('SUP-900');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('Demo Trading Two');
    await dialog
      .getByRole('button', { name: /^(Save supplier|حفظ المورد)$/ })
      .click();
    await expect(row.getByText('Demo Trading Two')).toBeVisible();

    await row.getByRole('button', { name: /^(Delete|حذف) / }).click();
    const confirm = page.getByRole('alertdialog');
    await expect(
      confirm.getByRole('button', { name: /^(Cancel|إلغاء)$/ }),
    ).toBeFocused();
    await confirm.getByRole('button', { name: /^(Delete|حذف)$/ }).click();
    await expect(row).toHaveCount(0);
  });

  test('a backend field error shows under the input', async ({ page }) => {
    await page.goto('/suppliers');
    await page
      .getByRole('button', { name: /^(Add supplier|إضافة مورد)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Code|الرمز)/).fill('SUP-001');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('Duplicate');
    await dialog
      .getByRole('button', { name: /^(Save supplier|حفظ المورد)$/ })
      .click();
    await expect(
      dialog.getByText(/Supplier code already exists|رمز المورد مستخدم مسبقاً/),
    ).toBeVisible();
  });
});
