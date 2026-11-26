import { expect, test } from '@playwright/test';
import { ARTICLE } from '../fixtures/app';
import { tags } from '../fixtures/html';

const HTML_PATHS = [
  '/ar',
  '/en/about',
  '/en/contact',
  `/ar/news/${ARTICLE.slug}`,
  '/en/nope',
  '/zz',
];

test.describe('security headers on every HTML response', () => {
  for (const path of HTML_PATHS) {
    test(path, async ({ request }) => {
      const response = await request.get(path);
      const headers = response.headers();

      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['permissions-policy']).toContain('camera=()');
      expect(headers['cross-origin-opener-policy']).toBe('same-origin');
      expect(headers['strict-transport-security']).toMatch(/max-age=\d{7,}/);
      expect(headers['x-powered-by']).toBeUndefined();
      expect(headers['cache-control']).toBe(
        response.status() === 200 ? 'private, no-cache' : 'no-store',
      );

      const csp = headers['content-security-policy'];
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");
    });
  }

  test('caching without nginx: public page private, admin never stored, hashed file immutable', async ({
    request,
  }) => {
    const page = await request.get('/en/about');
    expect(page.status()).toBe(200);
    expect(page.headers()['cache-control']).toBe('private, no-cache');

    const admin = await request.get('/en/admin/login', { maxRedirects: 0 });
    expect(admin.status()).toBe(200);
    expect(admin.headers()['cache-control']).toBe('private, no-store');

    const script = /"(\/assets\/[^"]+\.js)"/.exec(await page.text())?.[1];
    expect(script).toBeDefined();
    const asset = await request.get(script ?? '/');
    expect(asset.status()).toBe(200);
    expect(asset.headers()['cache-control']).toContain('max-age=31536000');
    expect(asset.headers()['cache-control']).toContain('immutable');
  });

  test('the CSP nonce is fresh per response and is the one on every inline script', async ({
    request,
  }) => {
    const first = await request.get('/en');
    const second = await request.get('/en');
    const nonceOf = (csp: string | undefined) => /'nonce-([^']+)'/.exec(csp ?? '')?.[1];
    const a = nonceOf(first.headers()['content-security-policy']);
    const b = nonceOf(second.headers()['content-security-policy']);
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);

    const html = await first.text();
    const inline = tags(html, 'script').filter((tag) => tag['src'] === undefined);
    expect(inline.length).toBeGreaterThan(0);
    for (const script of inline) {
      expect(script['nonce']).toBe(a);
    }
  });
});
