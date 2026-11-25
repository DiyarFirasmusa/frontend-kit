import { expect, test } from '@playwright/test';
import { metaContent, titles } from '../fixtures/html';

// A missing thing is a real 404, a moved thing is a 301, and "/" is a temporary redirect.
test.describe('redirects', () => {
  test('"/" goes to Arabic by default, and keeps the query', async ({ request }) => {
    const response = await request.get('/?utm_source=x', { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toBe('/ar?utm_source=x');
    expect(response.headers()['vary']).toContain('Accept-Language');
  });

  test('"/" follows the browser language', async ({ request }) => {
    const response = await request.get('/', {
      maxRedirects: 0,
      headers: { 'accept-language': 'en-US,en;q=0.9' },
    });
    expect(response.headers()['location']).toBe('/en');
  });

  test('"/" prefers the saved language cookie', async ({ request }) => {
    const response = await request.get('/', {
      maxRedirects: 0,
      headers: { cookie: 'lang=en', 'accept-language': 'ar' },
    });
    expect(response.headers()['location']).toBe('/en');
  });

  test('uppercase and trailing slashes get a permanent redirect to the one spelling', async ({
    request,
  }) => {
    for (const [from, to] of [
      ['/AR/About', '/ar/about'],
      ['/en/', '/en'],
      ['/en/news/Plan-Your-First-Quarter/', '/en/news/plan-your-first-quarter'],
      ['/en/news/?page=2', '/en/news?page=2'],
    ] as const) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(301);
      expect(response.headers()['location'], from).toBe(to);
    }
  });
});

test.describe('not found', () => {
  for (const path of [
    '/zz',
    '/zz/about',
    '/ar/does-not-exist',
    '/en/news/no-such-article',
    '/ar/news/x/y',
  ]) {
    test(`${path} is a real 404, noindex, with a title`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(404);
      expect(response.headers()['x-robots-tag']).toContain('noindex');
      const html = await response.text();
      expect(metaContent(html, 'name', 'robots')).toContain('noindex');
      expect(titles(html)).toHaveLength(1);
      expect(html).not.toContain('rel="canonical"');
    });
  }

  test('the 404 page speaks the language of the URL', async ({ request }) => {
    expect(await (await request.get('/en/nope')).text()).toContain('Page not found');
    expect(await (await request.get('/ar/nope')).text()).toContain('الصفحة غير موجودة');
  });

  test('missing build files are 404, not the app', async ({ request }) => {
    const response = await request.get('/assets/does-not-exist.js');
    expect(response.status()).toBe(404);
  });
});
