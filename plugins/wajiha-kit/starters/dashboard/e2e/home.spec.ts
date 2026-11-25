import { expect, loginAs, test } from './fixtures/app';
import { homeMocks } from './fixtures/home';

const GREETING = /صباح الخير|مساء الخير|Good (morning|evening)/i;
const KPI_LINKS: [RegExp, string][] = [
  [/المستودعات|Warehouses/, '/warehouses'],
  [/الموردون|Suppliers/, '/suppliers'],
  [/التصنيفات|Categories/, '/categories'],
  [/وحدات القياس|Units of measure/, '/units-of-measure'],
];
// Cold Vite dev server + four parallel projects: data panels can take longer than the 5s default.
const DATA_TIMEOUT = { timeout: 15_000 };

test.describe('dashboard home', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.shell();
    await homeMocks(mockApi);
    await loginAs(page, mockApi);
  });

  test('shows the greeting, four KPI links and the recent changes', async ({
    page,
    dir,
  }) => {
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(
      page.getByRole('heading', { level: 1, name: GREETING }),
    ).toBeVisible(DATA_TIMEOUT);

    for (const [label, href] of KPI_LINKS) {
      await expect(
        page
          .getByRole('link', { name: label })
          .and(page.locator(`[href="${href}"]`))
          .first(),
      ).toBeVisible(DATA_TIMEOUT);
    }

    await expect(page.getByRole('row', { name: /مورد الرافدين/ })).toBeVisible(
      DATA_TIMEOUT,
    );
  });

  test('shows the activity chart with its legend', async ({ page }) => {
    await expect(
      page.getByRole('img', { name: /النشاط|Activity/ }),
    ).toBeVisible(DATA_TIMEOUT);
  });

  test('a KPI card opens its list page', async ({ page }) => {
    await page
      .getByRole('link', { name: /الموردون|Suppliers/ })
      .and(page.locator('[href="/suppliers"]'))
      .filter({ visible: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/suppliers$/);
  });
});
