import { expect, test } from './fixtures/app';
import {
  CATEGORY_PERMISSIONS,
  mockCategories,
  signInWithPermissions,
} from './fixtures/categories';

test.describe('categories and attributes', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.shell();
    await mockCategories(mockApi);
    await signInWithPermissions(page, mockApi, CATEGORY_PERMISSIONS);
  });

  test('shows inherited attributes read-only and toggles a required flag', async ({
    page,
    dir,
  }) => {
    await page.goto('/categories');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);

    await page.getByText('حماية اليدين').first().click();
    await expect(
      page
        .getByText(/Inherited attribute, read-only|خاصية موروثة للقراءة فقط/)
        .first(),
    ).toBeVisible();
    await expect(page.getByText('معدات السلامة').first()).toBeVisible();

    const put = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' &&
        request
          .url()
          .endsWith('/api/item-categories/cat-hand/attributes/asg-2'),
    );
    await page
      .getByRole('row', { name: /اللون/ })
      .getByRole('switch')
      .first()
      .click();

    expect((await put).postDataJSON()).toMatchObject({
      attributeDefinitionId: 'attr-color',
      isRequired: true,
      isVariantAxis: true,
    });
  });

  test('creates a category under the selected parent', async ({
    page,
    dir,
  }) => {
    await page.goto('/categories');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);

    await page.getByText('معدات السلامة').first().click();
    await page
      .getByRole('button', { name: /إضافة تصنيف|add category/i })
      .first()
      .click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/اسم التصنيف|Category name/).fill('Gloves');

    const post = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().endsWith('/api/item-categories'),
    );
    await dialog.getByRole('button', { name: /^(Save|حفظ)$/ }).click();

    expect((await post).postDataJSON()).toEqual({
      name: 'Gloves',
      parentId: 'cat-safety',
      isActive: true,
    });
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Gloves').first()).toBeVisible();
  });

  test('adds an option to an OPTION attribute', async ({ page, dir }) => {
    await page.goto('/attributes');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);

    await page
      .getByRole('row', { name: /اللون/ })
      .getByRole('button', { name: /تحرير الخيارات|edit options/i })
      .click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole('button', { name: /^(Add option|إضافة خيار)$/ })
      .click();
    await dialog.getByLabel(/اسم الخيار|Option label/).fill('Red');

    await dialog
      .getByRole('button', { name: /^(Add to list|إضافة إلى القائمة)$/ })
      .click();

    const post = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().endsWith('/api/attribute-definitions/attr-color/options'),
    );
    await dialog
      .getByRole('button', { name: /^(Save options|حفظ الخيارات)$/ })
      .click();

    const body = (await post).postDataJSON();
    expect(body).toMatchObject({ label: 'Red' });
    expect(body).not.toHaveProperty('code');
  });

  test('shows item counts and blocks deleting a category that has items', async ({
    page,
    dir,
  }) => {
    let deletes = 0;
    page.on('request', (request) => {
      if (request.method() === 'DELETE') {
        deletes += 1;
      }
    });
    await page.goto('/categories');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(
      page.getByText(/^(Items: 184|الأصناف: 184)$/).first(),
    ).toBeAttached();

    await page.getByText('حماية اليدين').first().click();
    await page
      .getByRole('button', { name: /^(Delete|حذف)$/ })
      .first()
      .click();

    const dialog = page.getByRole('dialog', {
      name: /Can't delete this category|تعذر حذف التصنيف/,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('62', { exact: true })).toHaveCount(2);
    expect(deletes).toBe(0);
  });
});
