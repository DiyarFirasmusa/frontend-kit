import { expect, test } from '@playwright/test';
import { tags } from '../fixtures/html';

// Limits and headers outside the page middleware: the contact form before hydration, server function body
// size, and files served straight from public/ and the build.
test.describe('hardening', () => {
  test('the server-rendered contact form posts, so an early submit never puts the message in the URL', async ({
    request,
  }) => {
    const html = await (await request.get('/ar/contact')).text();
    expect(tags(html, 'form')[0]?.['method']).toBe('post');
    // The send button stays disabled until React has taken over the form.
    const submit = tags(html, 'button').find((tag) => tag['type'] === 'submit');
    expect(submit?.['disabled']).toBeDefined();
  });

  test('a server function body over the limit is refused before it is read', async ({
    request,
  }) => {
    const response = await request.post('/_serverFn/anything', {
      data: 'x'.repeat(20 * 1024),
      headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' },
    });
    expect(response.status()).toBe(413);
  });

  test('static files carry nosniff, and images a CSP that blocks scripts', async ({ request }) => {
    for (const path of ['/favicon.svg', '/images/news-plan.svg', '/og-default.png']) {
      const headers = (await request.get(path)).headers();
      expect(headers['x-content-type-options'], path).toBe('nosniff');
      expect(headers['content-security-policy'], path).toContain("default-src 'none'");
      expect(headers['content-security-policy'], path).toContain('sandbox');
    }
    const manifest = (await request.get('/site.webmanifest')).headers();
    expect(manifest['x-content-type-options']).toBe('nosniff');
  });

  test('built JavaScript is sent compressed', async ({ request }) => {
    const html = await (await request.get('/en')).text();
    const script = /\/assets\/[^"]+\.js/.exec(html)?.[0];
    expect(script).toBeDefined();
    const response = await request.get(script ?? '', {
      headers: { 'accept-encoding': 'br, gzip' },
    });
    expect(response.headers()['content-encoding']).toMatch(/br|gzip/);
  });
});
