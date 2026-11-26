import { expect, loginAs, test } from './fixtures/app';

const SERVER_TITLE = /The server ran into a problem|حدثت مشكلة في الخادم/;
const NETWORK_TITLE = /No internet connection|لا يوجد اتصال بالإنترنت/;
// A failed request while the browser is online names the server, not the internet.
const UNREACHABLE_TITLE = /The server can't be reached|يتعذّر الوصول إلى الخادم/;
const UOM_TITLE = /Units of measure|وحدات القياس/;

test.describe('error pages', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await loginAs(page, mockApi);
    await mockApi.shell();
  });

  test('a request that cannot reach the server shows the network error page', async ({
    page,
  }) => {
    await page.route('**/api/units-of-measure*', (route) =>
      route.abort('internetdisconnected'),
    );

    await page.goto('/units-of-measure');

    await expect(
      page.getByRole('heading', { level: 1, name: UNREACHABLE_TITLE }),
    ).toBeVisible();
  });

  test('going offline shows the network page and coming back online recovers', async ({
    page,
    context,
    mockApi,
  }) => {
    await mockApi.json('**/api/units-of-measure*', []);
    await page.goto('/units-of-measure');
    await expect(
      page.getByRole('heading', { level: 1, name: UOM_TITLE }),
    ).toBeVisible();

    await context.setOffline(true);
    await expect(
      page.getByRole('heading', { level: 1, name: NETWORK_TITLE }),
    ).toBeVisible();

    await context.setOffline(false);
    await expect(
      page.getByRole('heading', { level: 1, name: UOM_TITLE }),
    ).toBeVisible();
  });

  test('the /500 route renders the standalone server error page', async ({
    page,
  }) => {
    await page.goto('/500');

    await expect(
      page.getByRole('heading', { level: 1, name: SERVER_TITLE }),
    ).toBeVisible();
  });

  test('the /404 route shows the not-found result with the list and home actions', async ({
    page,
  }) => {
    await page.goto('/404');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Item not found|العنصر غير موجود/,
      }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('button', { name: /Back to the list|العودة إلى القائمة/ })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^(Home|الرئيسية)$/ }),
    ).toBeVisible();
  });
});
