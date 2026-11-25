import { expect, test } from '@playwright/test';
import { alternates, canonical, metaContent, pngSize } from '../fixtures/html';

test.describe('robots.txt', () => {
  test('allows crawling, names the sitemap and never Disallows (noindex does the hiding)', async ({
    request,
    baseURL,
  }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    const text = await response.text();
    expect(text).toContain('User-agent: *');
    expect(text).toContain(`Sitemap: ${baseURL}/sitemap.xml`);
    expect(text).not.toMatch(/^Disallow:\s*\S/m);
  });
});

test.describe('sitemap.xml', () => {
  test('lists every page in both languages, on the site origin, each one indexable and canonical to itself', async ({
    request,
    baseURL,
  }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');
    const xml = await response.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '');

    expect(locs.length).toBeGreaterThanOrEqual(2 * 6);
    expect(new Set(locs).size, 'no duplicate URLs').toBe(locs.length);
    expect(locs).toEqual(
      expect.arrayContaining([`${baseURL}/ar`, `${baseURL}/en`, `${baseURL}/ar/contact`]),
    );
    for (const loc of locs) {
      expect(loc.startsWith(`${baseURL}/`), loc).toBe(true);
      expect(loc).toBe(loc.toLowerCase());
      expect(loc.endsWith('/')).toBe(false);

      const page = await request.get(loc.slice(baseURL?.length ?? 0), { maxRedirects: 0 });
      expect(page.status(), loc).toBe(200);
      const html = await page.text();
      expect(canonical(html), loc).toBe(loc);
      expect(metaContent(html, 'name', 'robots'), loc).not.toContain('noindex');

      // hreflang reciprocity: the other language's page lists this one back.
      for (const href of Object.values(alternates(html))) {
        const other = await request.get(href.slice(baseURL?.length ?? 0), { maxRedirects: 0 });
        expect(other.status(), href).toBe(200);
        expect(Object.values(alternates(await other.text())), href).toContain(loc);
      }
    }
  });

  test('contains no private or failed pages', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toMatch(/does-not-exist|\/api\/|_serverFn/i);
  });
});

test.describe('static files', () => {
  test('share image is a real 1200x630 PNG', async ({ request }) => {
    const response = await request.get('/og-default.png');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
    expect(pngSize(await response.body())).toEqual({ width: 1200, height: 630 });
  });

  test('favicon and the web manifest exist and are valid', async ({ request }) => {
    const icon = await request.get('/favicon.svg');
    expect(icon.status()).toBe(200);
    expect(icon.headers()['content-type']).toContain('svg');

    const manifest = await request.get('/site.webmanifest');
    expect(manifest.status()).toBe(200);
    const json = (await manifest.json()) as { name?: string; icons?: unknown[] };
    expect(json.name).toBeTruthy();
    expect(json.icons?.length).toBeGreaterThan(0);
  });

  test('hashed build files are cacheable for a year', async ({ request }) => {
    const html = await (await request.get('/ar')).text();
    const css = /href="(\/assets\/[^"]+\.css)"/.exec(html)?.[1];
    expect(css).toBeDefined();
    const response = await request.get(css ?? '/');
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toMatch(/immutable|max-age=31536000/);
  });
});
