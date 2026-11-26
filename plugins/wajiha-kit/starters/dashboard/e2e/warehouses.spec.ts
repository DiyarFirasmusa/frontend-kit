import { expect, loginAs, test } from './fixtures/app';

/* Runs against the shared demo backend (src/mocks): 7 seeded warehouses,
   WH-BGD-01 to WH-KRB-01, with locations and members. No fixture file of its own. */

const TITLE = /^(Warehouses|المستودعات)$/;
const CODE_HEADER = /^(Code|الرمز)/;
const ADD_BUTTON = /^(Add warehouse|إنشاء مستودع)$/;
const SAVE_BUTTON = /^(Save warehouse|حفظ المستودع)$/;
const REMOVE = /^(Remove|إزالة)$/;

test.describe('warehouses', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.backend();
    await loginAs(page, mockApi);
  });

  test('sorts on the server, filters from the URL and opens a warehouse', async ({
    page,
    dir,
  }) => {
    await page.goto('/warehouses');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(
      page.getByRole('heading', { level: 1, name: TITLE }),
    ).toBeVisible();
    const table = page.getByRole('table');
    await expect(table.getByText('WH-BGD-01', { exact: true })).toBeVisible();

    const header = page.getByRole('columnheader', { name: CODE_HEADER });
    await header.getByRole('button').click();
    await header.getByRole('button').click();
    await expect(page).toHaveURL(/sort=code\.desc/);
    await expect(page.getByRole('row').nth(1)).toContainText('WH-TRN-01');

    await page.goto('/warehouses?type=transit');
    await expect(table.getByText('WH-TRN-01', { exact: true })).toBeVisible();
    await expect(table.getByText('WH-BGD-01', { exact: true })).toBeHidden();

    await table
      .getByRole('row')
      .filter({ hasText: 'WH-TRN-01' })
      .getByRole('link')
      .click();
    await expect(page).toHaveURL(/\/warehouses\/[\w-]+$/);
    await expect(
      page.getByRole('textbox', { name: /^(Warehouse code|رمز المستودع)/ }),
    ).toHaveText('WH-TRN-01');
    await expect(
      page
        .locator('header')
        .getByText(/^(Transit warehouse|مستودع عبور)$/)
        .first(),
    ).toBeVisible();
  });

  test('on a phone the name ellipsizes beside the actions instead of being cut', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/warehouses');
    const row = page.getByRole('row').nth(1);
    const name = row.locator('a[href^="/warehouses/"]');
    await expect(name).toBeVisible();

    expect(
      await name.evaluate((node) => getComputedStyle(node).textOverflow),
    ).toBe('ellipsis');
    const nameBox = await name.boundingBox();
    const actionsBox = await row.locator('td').last().boundingBox();
    if (!nameBox || !actionsBox) {
      throw new Error('row has no layout');
    }
    const overlaps =
      nameBox.x < actionsBox.x + actionsBox.width &&
      actionsBox.x < nameBox.x + nameBox.width;
    expect(overlaps).toBe(false);
  });

  test('a filtered view survives a reload', async ({ page }) => {
    await page.goto('/warehouses');
    await page.getByRole('searchbox').fill('WH-KRB');
    await expect(page).toHaveURL(/q=WH-KRB/);
    const table = page.getByRole('table');
    await expect(table.getByText('WH-BGD-01', { exact: true })).toBeHidden();
    await page.reload();
    await expect(table.getByText('WH-KRB-01', { exact: true })).toBeVisible();
    await expect(page.getByRole('searchbox')).toHaveValue('WH-KRB');
  });

  test('adds, edits and deletes a warehouse', async ({ page }) => {
    await page.goto('/warehouses');
    await page.getByRole('button', { name: ADD_BUTTON }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Code|الرمز)/).fill('WH-NEW-01');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('North depot');
    await dialog
      .getByLabel(/^(Address|العنوان)/)
      .fill('Karbala, industrial zone');
    await dialog.getByRole('button', { name: SAVE_BUTTON }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('searchbox').fill('WH-NEW-01');
    const row = page.getByRole('row').filter({ hasText: 'WH-NEW-01' });
    await expect(row).toBeVisible();

    await row.getByRole('button', { name: /^(Edit|تعديل) / }).click();
    await expect(dialog.getByLabel(/^(Name|الاسم)/)).toHaveValue('North depot');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('North depot two');
    await dialog.getByRole('button', { name: SAVE_BUTTON }).click();
    await expect(row.getByText('North depot two')).toBeVisible();

    await row.getByRole('button', { name: /^(Delete|حذف) / }).click();
    const confirm = page.getByRole('alertdialog');
    await expect(
      confirm.getByRole('button', { name: /^(Cancel|إلغاء)$/ }),
    ).toBeFocused();
    await confirm.getByRole('button', { name: /^(Delete|حذف)$/ }).click();
    await expect(row).toHaveCount(0);
  });

  test('a backend field error shows under the input', async ({ page }) => {
    await page.goto('/warehouses');
    await page.getByRole('button', { name: ADD_BUTTON }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Code|الرمز)/).fill('WH-BGD-01');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('Duplicate');
    await dialog.getByLabel(/^(Address|العنوان)/).fill('Somewhere');
    await dialog.getByRole('button', { name: SAVE_BUTTON }).click();
    await expect(
      dialog.getByText(
        /Warehouse code already exists|رمز المستودع مستخدم مسبقاً/,
      ),
    ).toBeVisible();
  });

  test('a warehouse with locations cannot be deleted from the list', async ({
    page,
  }) => {
    await page.goto('/warehouses?q=WH-BGD');
    const row = page.getByRole('row').filter({ hasText: 'WH-BGD-01' });
    const remove = row.getByRole('button', { name: /^(Delete|حذف) / });
    await expect(remove).toHaveAttribute('aria-disabled', 'true');
    await remove.click({ force: true });
    await expect(page.getByRole('alertdialog')).toBeHidden();
  });

  test('shows the top-level zones and members of a warehouse', async ({
    page,
    dir,
  }) => {
    await page.goto('/warehouses?q=WH-BGD');
    await page
      .getByRole('row')
      .filter({ hasText: 'WH-BGD-01' })
      .getByRole('link')
      .click();
    await page.getByRole('tab', { name: /^(Locations|المواقع)$/ }).click();
    await expect(page).toHaveURL(/tab=locations/);
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(page.getByText('منطقة الاستلام').first()).toBeVisible();
    await expect(
      page.getByText(/15 sub-locations|15 موقعاً فرعياً/).first(),
    ).toBeVisible();

    await page.getByRole('tab', { name: /^(Members|الأعضاء)$/ }).click();
    await expect(page).toHaveURL(/tab=members/);
    await expect(
      page
        .getByRole('button', { name: /Member actions|إجراءات العضو/ })
        .first(),
    ).toBeVisible();
  });

  test('changes a member role and removes a member with one request each', async ({
    page,
  }) => {
    await page.goto('/warehouses?q=WH-BGD');
    await page
      .getByRole('row')
      .filter({ hasText: 'WH-BGD-01' })
      .getByRole('link')
      .click();
    await page.getByRole('tab', { name: /^(Members|الأعضاء)$/ }).click();

    const roleRequest = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' && /\/users\/[\w-]+$/.test(request.url()),
    );
    await page
      .getByRole('combobox', { name: /Change role|تغيير الدور/ })
      .nth(2)
      .click();
    await page
      .getByRole('option', { name: /^(Stock controller|مراقب المخزون)$/ })
      .click();
    expect((await roleRequest).postDataJSON()).toEqual({
      role: 'STOCK_CONTROLLER',
    });

    const removeRequest = page.waitForRequest(
      (request) =>
        request.method() === 'DELETE' && /\/users\/[\w-]+$/.test(request.url()),
    );
    await page
      .getByRole('button', { name: /Member actions|إجراءات العضو/ })
      .nth(3)
      .click();
    await page.getByRole('menuitem', { name: REMOVE }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: REMOVE })
      .click();
    await removeRequest;
    await expect(page.getByRole('alertdialog')).toBeHidden();
  });

  test('shows the not-found card when the warehouse does not exist', async ({
    page,
  }) => {
    await page.goto('/warehouses/wh-404');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Item not found|العنصر غير موجود/,
      }),
    ).toBeVisible();
    await expect(page.getByText('wh-404')).toBeVisible();
  });
});
