import { expect, loginAs, test } from './fixtures/app';
import { mockWarehouses } from './fixtures/warehouses';

const SEARCH_RESPONSE = {
  warehouses: [
    { id: 'wh-1', code: 'BGD-01', name: 'Central warehouse', isActive: true },
  ],
  suppliers: [
    { id: 'sup-1', code: 'SUP-001', name: 'Acme Supplies', isActive: true },
  ],
  categories: [
    { id: 'cat-1', code: 'CAT-01', name: 'Packaging', isActive: true },
  ],
  units: [],
};

test.describe('global search', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.shell();
    await mockWarehouses(mockApi);
    await loginAs(page, mockApi);
  });

  test('searches after the debounce, navigates by keyboard and focuses with the shortcut', async ({
    page,
    dir,
  }) => {
    const queries: string[] = [];
    await page.route('**/api/search*', (route) => {
      queries.push(new URL(route.request().url()).searchParams.get('q') ?? '');
      return route.fulfill({ json: SEARCH_RESPONSE });
    });

    await page.goto('/warehouses');
    await expect(page.getByText('Baghdad central warehouse')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    expect(queries).toHaveLength(0);

    const search = page.getByRole('combobox', {
      name: /Global search|البحث الشامل/,
    });
    await expect(search).toBeVisible();
    await page.keyboard.press('Control+K');
    await expect(search).toBeFocused();

    await search.pressSequentially('ce');
    const listbox = page.getByRole('listbox', {
      name: /Search results|نتائج البحث/,
    });
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole('option')).toHaveCount(3);
    expect(queries).toEqual(['ce']);

    await search.press('Escape');
    await expect(listbox).toBeHidden();

    await search.press('ArrowDown');
    await search.press('ArrowDown');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/suppliers$/);
  });

  test('shows the empty state without leaving the page', async ({ page }) => {
    await page.route('**/api/search*', (route) =>
      route.fulfill({
        json: { warehouses: [], suppliers: [], categories: [], units: [] },
      }),
    );
    await page.goto('/warehouses');
    await expect(page.getByText('Baghdad central warehouse')).toBeVisible();

    await page
      .getByRole('combobox', { name: /Global search|البحث الشامل/ })
      .fill('zzz');

    await expect(page.getByRole('status')).toHaveText(
      /No results found|لا توجد نتائج/,
    );
  });
});
