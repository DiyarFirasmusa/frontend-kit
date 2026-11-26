import { categories } from '../src/mocks/seed/categories';
import { expect, loginAs, test } from './fixtures/app';

/* Runs against the shared demo backend (src/mocks): 31 seeded categories and
   13 attribute definitions. No fixture file of its own. */

function idOf(code: string): string {
  const found = categories.find((category) => category.code === code);
  if (!found) {
    throw new Error(`seed category ${code} missing`);
  }
  return found.id;
}

const CODE_HEADER = /^(Code|الرمز)/;

test.describe('categories', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.backend();
    await loginAs(page, mockApi);
  });

  test('shows inherited attributes read-only and toggles a required flag', async ({
    page,
    dir,
  }) => {
    await page.goto(`/categories?category=${idOf('BLD-STL')}`);
    await expect(page.locator('html')).toHaveAttribute('dir', dir);

    await expect(page.getByText('بلد المنشأ').first()).toBeVisible();
    await expect(
      page
        .getByText(/Inherited attribute, read-only|خاصية موروثة للقراءة فقط/)
        .first(),
    ).toBeVisible();

    const put = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' &&
        request.url().includes('/api/item-categories/'),
    );
    await page
      .getByRole('row', { name: /الطول/ })
      .getByRole('switch')
      .first()
      .click();
    expect((await put).postDataJSON()).toMatchObject({ isRequired: false });
  });

  test('the selected category and the search live in the URL', async ({
    page,
  }) => {
    await page.goto('/categories');
    await page.getByRole('button', { name: /^مواد غذائية/ }).click();
    await expect(page).toHaveURL(new RegExp(`category=${idOf('FOOD')}`));

    await page.getByRole('searchbox').fill('FOOD-OIL');
    await expect(page).toHaveURL(/q=FOOD-OIL/);
    await expect(
      page.getByRole('button', { name: /^زيوت ودهون/ }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /^مشروبات/ })).toBeHidden();

    await page.reload();
    await expect(page.getByRole('searchbox')).toHaveValue('FOOD-OIL');
    await expect(
      page.getByRole('button', { name: /^زيوت ودهون/ }),
    ).toBeVisible();
  });

  test('the tree search box is one field, not an input with a gap below it', async ({
    page,
  }) => {
    await page.goto('/categories');
    const input = page.getByRole('searchbox');
    const field = input.locator('..');
    await expect(input).toBeVisible();
    const inputBox = await input.boundingBox();
    const fieldBox = await field.boundingBox();
    const iconBox = await field.locator('svg').first().boundingBox();
    if (!inputBox || !fieldBox || !iconBox) {
      throw new Error('search field has no layout');
    }
    expect(fieldBox.height).toBeLessThanOrEqual(inputBox.height + 1);
    expect(iconBox.y).toBeGreaterThanOrEqual(inputBox.y);
    expect(iconBox.y + iconBox.height).toBeLessThanOrEqual(
      inputBox.y + inputBox.height,
    );
  });

  test('creates a category under the selected parent', async ({ page }) => {
    await page.goto(`/categories?category=${idOf('OFF')}`);
    await page
      .getByRole('button', { name: /^(Add category|إضافة تصنيف)$/ })
      .click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Category name|اسم التصنيف)/).fill('Gloves');
    const post = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().endsWith('/api/item-categories'),
    );
    await dialog.getByRole('button', { name: /^(Save|حفظ)$/ }).click();

    expect((await post).postDataJSON()).toEqual({
      name: 'Gloves',
      parentId: idOf('OFF'),
      isActive: true,
    });
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Gloves').first()).toBeVisible();
  });

  test('a backend field error shows under the input', async ({ page }) => {
    await page.goto(`/categories?category=${idOf('OFF')}`);
    await page
      .getByRole('button', { name: /^(Add category|إضافة تصنيف)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog
      .getByLabel(/^(Category name|اسم التصنيف)/)
      .fill('ورق وقرطاسية');
    await dialog.getByRole('button', { name: /^(Save|حفظ)$/ }).click();
    await expect(
      dialog.getByText(
        /A category with this name already exists here|يوجد تصنيف بهذا الاسم/,
      ),
    ).toBeVisible();
  });

  test('shows item counts and blocks deleting a category that has items', async ({
    page,
  }) => {
    let deletes = 0;
    page.on('request', (request) => {
      if (request.method() === 'DELETE') {
        deletes += 1;
      }
    });
    await page.goto(`/categories?category=${idOf('FOOD-OIL')}`);
    await expect(
      page.getByText(/^(Items: 4|الأصناف: 4)$/).first(),
    ).toBeAttached();

    await page
      .getByRole('button', { name: /^(Delete|حذف)$/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog', {
      name: /Can't delete this category|تعذر حذف التصنيف/,
    });
    await expect(dialog).toBeVisible();
    expect(deletes).toBe(0);
  });
});

test.describe('attributes', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.backend();
    await loginAs(page, mockApi);
  });

  test('pages and sorts on the server, and the URL keeps the state', async ({
    page,
    dir,
  }) => {
    await page.goto('/attributes');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    const table = page.getByRole('table');
    await expect(table.getByText('COLOR', { exact: true })).toBeVisible();

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
    await expect(table.getByText('WEIGHT', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: '2', exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(
      table.getByText('CAPACITY_OLD', { exact: true }),
    ).toBeVisible();
  });

  test('adds an option to an OPTION attribute', async ({ page }) => {
    await page.goto('/attributes?q=COLOR');
    await page
      .getByRole('button', { name: /^(Edit options of|تحرير خيارات) / })
      .click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole('button', { name: /^(Add option|إضافة خيار)$/ })
      .click();
    await dialog.getByLabel(/^(Option label|اسم الخيار)/).fill('Teal');
    await dialog
      .getByRole('button', { name: /^(Add to list|إضافة إلى القائمة)$/ })
      .click();

    const post = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().endsWith('/options'),
    );
    await dialog
      .getByRole('button', { name: /^(Save options|حفظ الخيارات)$/ })
      .click();
    const body = (await post).postDataJSON();
    expect(body).toMatchObject({ label: 'Teal' });
    expect(body).not.toHaveProperty('code');
  });

  test('adds, edits and deletes an attribute', async ({ page }) => {
    await page.goto('/attributes');
    await page
      .getByRole('button', { name: /^(Add attribute|إضافة خاصية)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Attribute name|اسم الخاصية)/).fill('Thickness');
    await dialog
      .getByRole('button', { name: /^(Save attribute|حفظ الخاصية)$/ })
      .click();
    await expect(dialog).toBeHidden();

    await page.getByRole('searchbox').fill('Thickness');
    const row = page.getByRole('row').filter({ hasText: 'Thickness' });
    await expect(row).toBeVisible();

    await row
      .getByRole('button', { name: /^(Edit|تعديل) / })
      .first()
      .click();
    await expect(
      dialog.getByLabel(/^(Attribute name|اسم الخاصية)/),
    ).toHaveValue('Thickness');
    await dialog
      .getByLabel(/^(Attribute name|اسم الخاصية)/)
      .fill('Thickness 2');
    await dialog
      .getByRole('button', { name: /^(Save attribute|حفظ الخاصية)$/ })
      .click();
    await expect(dialog).toBeHidden();

    await page.getByRole('searchbox').fill('Thickness 2');
    const edited = page.getByRole('row').filter({ hasText: 'Thickness 2' });
    await edited.getByRole('button', { name: /^(Delete|حذف) / }).click();
    const confirm = page.getByRole('alertdialog');
    await expect(
      confirm.getByRole('button', { name: /^(Cancel|إلغاء)$/ }),
    ).toBeFocused();
    await confirm.getByRole('button', { name: /^(Delete|حذف)$/ }).click();
    await expect(edited).toHaveCount(0);
  });

  test('a backend field error shows under the input', async ({ page }) => {
    await page.goto('/attributes');
    await page
      .getByRole('button', { name: /^(Add attribute|إضافة خاصية)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Attribute name|اسم الخاصية)/).fill('اللون');
    await dialog
      .getByRole('button', { name: /^(Save attribute|حفظ الخاصية)$/ })
      .click();
    await expect(
      dialog.getByText(
        /Attribute name already exists|اسم الخاصية مستخدم مسبقاً/,
      ),
    ).toBeVisible();
  });
});
