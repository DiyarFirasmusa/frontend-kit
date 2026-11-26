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

      const csp = headers['content-security-policy'];
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");
    });
  }

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
