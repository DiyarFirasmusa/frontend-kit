import { expect, test } from '@playwright/test';
import { ARTICLE } from '../fixtures/app';
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
      ['/EN/NEWS/', '/en/news'],
      [`/en/News/${ARTICLE.slug}/`, `/en/news/${ARTICLE.slug}`],
      ['/en/news/?page=2', '/en/news?page=2'],
      ['/AR//About//', '/ar/about'],
      // A slug in another case goes to the stored spelling, in one hop, because that page exists.
      [`/en/news/${ARTICLE.slug.toUpperCase()}`, `/en/news/${ARTICLE.slug}`],
      [`/EN/NEWS/${ARTICLE.slug.toUpperCase()}/?x=1`, `/en/news/${ARTICLE.slug}?x=1`],
    ] as const) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(301);
      expect(response.headers()['location'], from).toBe(to);
    }
  });

  test('a redirect always lands on a page: its target answers 200, never 404', async ({
    request,
  }) => {
    const response = await request.get(`/EN/NEWS/${ARTICLE.slug.toUpperCase()}/`);
    expect(response.url()).toMatch(new RegExp(`/en/news/${ARTICLE.slug}$`));
    expect(response.status()).toBe(200);
  });

  test('a URL that names nothing is a direct 404, never a redirect to one', async ({ request }) => {
    for (const path of [
      '/EN/NOTHING/',
      '/xx/',
      '/zz/about/',
      '/en/Nothing',
      '/EN/NEWS/NO-SUCH-ARTICLE/',
      '/en/news/No-Such-Article',
      `/en/news/${ARTICLE.slug}/extra`,
      '/ar/news/%d9%85%d9%82%d8%a7%d9%84',
      '/ar/news/%D9%85%D9%82%D8%A7%D9%84',
      '/ar/news/مقال',
    ]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBe(404);
      expect(response.headers()['location'], path).toBeUndefined();
    }
  });

  test('only GET and HEAD are redirected: a 301 would turn a POST into a GET and lose the body', async ({
    request,
  }) => {
    const response = await request.post('/AR/contact/', { data: 'x=1', maxRedirects: 0 });
    // The framework may still answer 307 (it keeps the method); 301 is what would lose the body.
    expect(response.status()).not.toBe(301);
  });
});

test.describe('not found', () => {
  for (const path of [
    '/zz',
    '/zz/about',
    '/xx/about',
    '/EN/about/extra',
    '/en/nothing/extra',
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
