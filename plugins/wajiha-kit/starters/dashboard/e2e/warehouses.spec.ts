import { expect, loginAs, test } from './fixtures/app';
import {
  MEMBERS,
  mockWarehouseListFilters,
  mockWarehouses,
  WAREHOUSES,
} from './fixtures/warehouses';

test.describe('warehouses', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.shell();
    await mockWarehouses(mockApi);
    await mockWarehouseListFilters(page);
    await loginAs(page, mockApi);
  });

  test('lists, filters and opens a warehouse', async ({ page, dir }) => {
    await page.goto('/warehouses');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(page.getByText('Baghdad central warehouse')).toBeVisible();
    await expect(page.getByText('Transit depot')).toBeVisible();
    const baghdadRow = page.getByRole('row', {
      name: /Baghdad central warehouse/,
    });
    await expect(
      baghdadRow.getByRole('cell', { name: '3', exact: true }),
    ).toBeVisible();

    const search = page.getByPlaceholder(
      /Search by name or code|ابحث بالاسم أو الرمز/,
    );
    const searched = page.waitForRequest(
      (request) =>
        new URL(request.url()).searchParams.get('q') === 'TRN' &&
        new URL(request.url()).pathname === '/api/warehouses',
    );
    await search.fill('TRN');
    await searched;
    await expect(page.getByText('Baghdad central warehouse')).toBeHidden();
    await expect(page.getByText('Transit depot')).toBeVisible();

    await search.fill('');
    await page.getByText('Baghdad central warehouse').click();
    await expect(page).toHaveURL(/\/warehouses\/wh-1$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Baghdad central warehouse',
      }),
    ).toBeVisible();
    await expect(
      page.getByText('Baghdad, industrial zone').first(),
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: /^(Warehouse code|رمز المستودع)/ }),
    ).toHaveText('BGD-01');
  });

  test('removes a member after confirmation', async ({ page, dir }) => {
    let deleted: string | null = null;
    await page.route(
      '**/api/warehouses/wh-1/users/6f1d2c3a-0000-4000-8000-000000000002',
      async (route) => {
        if (route.request().method() !== 'DELETE') {
          await route.fallback();
          return;
        }
        deleted = route.request().url();
        await route.fulfill({ status: 204, body: '' });
      },
    );

    await page.goto('/warehouses/wh-1?tab=members');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(page.getByText('سارة علي').first()).toBeVisible();
    await page
      .getByRole('button', { name: /Member actions|إجراءات العضو/ })
      .first()
      .click();
    await page.getByRole('menuitem', { name: /^(Remove|إزالة)$/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /^(Remove|إزالة)$/ }).click();

    await expect
      .poll(() => (deleted ? new URL(deleted).pathname : null))
      .toBe('/api/warehouses/wh-1/users/6f1d2c3a-0000-4000-8000-000000000002');
  });

  test('changes a member role with one request', async ({ page, dir }) => {
    let body: unknown;
    await page.route(
      '**/api/warehouses/wh-1/users/6f1d2c3a-0000-4000-8000-000000000002',
      async (route) => {
        if (route.request().method() !== 'PUT') {
          await route.fallback();
          return;
        }
        body = route.request().postDataJSON();
        await route.fulfill({
          json: { ...MEMBERS[0], role: 'STOCK_CONTROLLER' },
        });
      },
    );

    await page.goto('/warehouses/wh-1?tab=members');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await page
      .getByRole('combobox', { name: /Change role|تغيير الدور/ })
      .click();
    await page
      .getByRole('option', { name: /^(Stock controller|مراقب المخزون)$/ })
      .click();

    await expect.poll(() => body).toEqual({ role: 'STOCK_CONTROLLER' });
  });

  test('shows the top-level zones of the warehouse', async ({ page, dir }) => {
    await page.goto('/warehouses/wh-1?tab=locations');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(page.getByText('Receiving zone')).toBeVisible();
    await expect(page.getByText(/1 sub-locations|1 موقعاً فرعياً/)).toBeVisible();
    await expect(page.getByText('Receiving bay 1')).toBeHidden();
  });

  test('creates a warehouse through the form dialog', async ({ page, dir }) => {
    let created: unknown;
    await page.route('**/api/warehouses', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      created = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        json: {
          id: 'wh-3',
          name: 'North depot',
          code: 'NRT-01',
          address: null,
          hrOrgUnitId: null,
          managerEmployeeId: null,
          managerUserId: null,
          isTransit: false,
          isActive: true,
          createdAt: null,
          updatedAt: null,
        },
      });
    });

    await page.goto('/warehouses');
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await page
      .getByRole('button', { name: /^(Add warehouse|إنشاء مستودع)$/ })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/^(Name|الاسم)/).fill('North depot');
    await dialog.getByLabel(/^(Code|الرمز)/).fill('NRT-01');
    await dialog
      .getByLabel(/^(Address|العنوان)/)
      .fill('Karbala, industrial zone');
    await dialog
      .getByRole('button', { name: /Save warehouse|حفظ المستودع/ })
      .click();

    await expect
      .poll(() => created)
      .toEqual({
        name: 'North depot',
        code: 'NRT-01',
        address: 'Karbala, industrial zone',
        isTransit: false,
        isActive: true,
      });
    await expect(dialog).toBeHidden();
  });

  test('shows the transit badge in the header of a transit warehouse', async ({
    page,
    mockApi,
  }) => {
    await mockApi.json('**/api/warehouses/wh-2', WAREHOUSES[1]);
    await mockApi.json('**/api/warehouses/wh-2/users', []);
    await mockApi.json('**/api/warehouses/wh-2/locations', []);
    await page.goto('/warehouses/wh-2');

    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Transit depot',
    });
    await expect(heading).toBeVisible();
    await expect(
      page
        .locator('header')
        .filter({ has: heading })
        .getByText(/^(Transit warehouse|مستودع عبور)$/),
    ).toBeVisible();
  });

  test('shows the not-found card when the warehouse does not exist', async ({
    page,
    mockApi,
  }) => {
    await mockApi.json(
      '**/api/warehouses/wh-404',
      { message: 'not found' },
      404,
    );
    await mockApi.json('**/api/warehouses/wh-404/users', [], 404);
    await mockApi.json('**/api/warehouses/wh-404/locations', [], 404);
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
