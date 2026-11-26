import { expect, test } from '@playwright/test';
import { metaContent } from '../fixtures/html';

// The admin, as a crawler sees it: never indexable, never in the sitemap, and still behind the same
// security headers as the public pages. Its HTML is only the document shell (ssr: false).
const ADMIN_PATHS = ['/ar/admin', '/en/admin', '/en/admin/login', '/ar/admin/suppliers'];

test.describe('admin: hidden from search engines', () => {
  for (const path of ADMIN_PATHS) {
    test(`${path} is noindex in the header and in the HTML`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
      expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow');
      const html = await response.text();
      expect(metaContent(html, 'name', 'robots')).toBe('noindex, nofollow');
      expect(response.headers()['content-security-policy']).toContain("script-src 'self' 'nonce-");
      expect(response.headers()['x-frame-options']).toBe('DENY');
    });
  }

  test('no admin URL is in the sitemap', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toMatch(/\/admin/i);
  });

  test('robots.txt does not Disallow the admin (that would hide its noindex)', async ({
    request,
  }) => {
    const text = await (await request.get('/robots.txt')).text();
    expect(text).not.toMatch(/admin/i);
  });

  test('the public pages stay indexable next to it', async ({ request }) => {
    const response = await request.get('/en');
    expect(response.headers()['x-robots-tag']).toBeUndefined();
    expect(metaContent(await response.text(), 'name', 'robots')).not.toContain('noindex');
  });
});
