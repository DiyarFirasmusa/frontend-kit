import { expect, loginAs, test } from './fixtures/app';
import { mockSuppliers, type SupplierMockState } from './fixtures/suppliers';

const TITLE = /^(Suppliers|الموردون)$/;
const WRITE_TIMEOUT = { timeout: 15_000 };

test.describe('suppliers', () => {
  test.setTimeout(60_000);

  let state: SupplierMockState;

  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.shell();
    state = await mockSuppliers(page);
    await loginAs(page, mockApi);
  });

  test('lists the suppliers and searches on the server', async ({
    page,
    dir,
  }) => {
    await page.goto('/suppliers');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(
      page.getByRole('heading', { level: 1, name: TITLE }),
    ).toBeVisible();
    const table = page.getByRole('table');
    for (const code of ['SUP-001', 'SUP-002', 'SUP-003']) {
      await expect(table.getByText(code, { exact: true })).toBeVisible();
    }
    await page
      .getByPlaceholder(
        /Search by code, name or phone|ابحث بالرمز أو الاسم أو الهاتف/,
      )
      .fill('SUP-002');
    await expect.poll(() => state.lastQuery, WRITE_TIMEOUT).toBe('SUP-002');
    await expect(table.getByText('SUP-001', { exact: true })).toBeHidden();
  });

  test('adds a supplier', async ({ page }) => {
    await page.goto('/suppliers');
    await page
      .getByRole('button', { name: /^(Add supplier|إضافة مورد)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^(Code|الرمز)/).fill('SUP-010');
    await dialog.getByLabel(/^(Name|الاسم)/).fill('شركة بابل');
    await dialog
      .getByRole('button', { name: /^(Save supplier|حفظ المورد)$/ })
      .click();
    await expect
      .poll(() => state.writes.at(-1), WRITE_TIMEOUT)
      .toMatchObject({
        method: 'POST',
        body: { code: 'SUP-010', name: 'شركة بابل' },
      });
    await expect(
      page.getByRole('table').getByText('SUP-010', { exact: true }),
    ).toBeVisible(WRITE_TIMEOUT);
  });

  test('deactivates a supplier that is on documents', async ({ page }) => {
    await page.goto('/suppliers');
    const row = page.getByRole('row').filter({ hasText: 'SUP-002' });
    await row.getByRole('button', { name: /^(Deactivate|إيقاف)$/ }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^(Deactivate|إيقاف)$/ })
      .click();
    await expect
      .poll(() => state.writes.at(-1), WRITE_TIMEOUT)
      .toMatchObject({
        method: 'PUT',
        body: { code: 'SUP-002', isActive: false },
      });
  });
});
