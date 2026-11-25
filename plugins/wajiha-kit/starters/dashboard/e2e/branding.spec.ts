import { expect, loginAs, test } from './fixtures/app';

test.describe('branding and assets', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.shell();
  });

  test('serves the icons as real images', async ({ page }) => {
    for (const [path, type] of [
      ['/icon.svg', /image\/svg/],
      ['/favicon-32.png', /image\/png/],
      ['/apple-touch-icon.png', /image\/png/],
      ['/icon-192.png', /image\/png/],
      ['/icon-512.png', /image\/png/],
      ['/icon-maskable-512.png', /image\/png/],
    ] as const) {
      const response = await page.request.get(path);
      expect(response.ok(), path).toBe(true);
      expect(response.headers()['content-type'], path).toMatch(type);
    }
  });

  test('the login page head references the icons and a theme colour per scheme', async ({
    page,
  }) => {
    await page.goto('/login');

    await expect(
      page.locator('link[rel="icon"][type="image/svg+xml"]'),
    ).toHaveAttribute('href', '/icon.svg');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      'href',
      '/apple-touch-icon.png',
    );
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
  });

  test('loads no font or script from another origin', async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      const own = new URL(
        test.info().project.use.baseURL ?? 'http://localhost',
      );
      const isApi = url.hostname.endsWith('.e2e.test');
      if (url.protocol.startsWith('http') && url.host !== own.host && !isApi) {
        foreign.push(request.url());
      }
    });
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    expect(foreign).toEqual([]);
  });

  test('sets the theme, preset and direction on <html> before the app boots', async ({
    page,
    dir,
  }) => {
    await page.goto('/login');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-preset', 'neutral');
    await expect(html).toHaveAttribute('data-density', 'comfortable');
    await expect(html).toHaveAttribute('dir', dir);
  });

  test('shows the brand name in the sidebar', async ({
    page,
    mockApi,
    language,
  }) => {
    await loginAs(page, mockApi);
    const brand = language === 'ar' ? 'لوحة التحكم' : 'Dashboard';
    await expect(
      page.locator('aside').getByText(brand, { exact: true }).first(),
    ).toBeVisible();
  });
});
