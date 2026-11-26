// What a crawler or a chat app receives: the server HTML, with no JavaScript. A page that only looks right
// after hydration would pass a browser test and still fail here.
import { expect, test } from '@playwright/test';
import { SITE } from '../../src/config/site.config';
import { DEFAULT_LOCALE, LANGUAGES, LOCALES } from '../../src/shared/lib/i18n/languages';
import { ARTICLE, PAGES } from '../fixtures/app';
import {
  alternates,
  allMeta,
  canonical,
  h1Count,
  jsonLd,
  metaContent,
  tags,
  titles,
} from '../fixtures/html';

const cases = LOCALES.flatMap((language) =>
  PAGES.map((page) => ({
    ...LANGUAGES[language],
    language,
    page: page.name,
    path: `/${language}${page.path}`,
  })),
);

test.describe('server HTML of every public page', () => {
  for (const item of cases) {
    test(`${item.path}`, async ({ request, baseURL }) => {
      const response = await request.get(item.path);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/html');
      const html = await response.text();

      // Document language and direction are right in the first HTML: no flip after load.
      const root = tags(html, 'html')[0];
      expect(root?.['lang']).toBe(item.language);
      expect(root?.['dir']).toBe(item.dir);

      // One title, one h1, a real description.
      expect(titles(html)).toHaveLength(1);
      expect(titles(html)[0]?.length ?? 0).toBeGreaterThan(5);
      expect(h1Count(html)).toBe(1);
      expect((metaContent(html, 'name', 'description') ?? '').length).toBeGreaterThanOrEqual(40);

      // The browser toolbar colour, one tag per colour scheme (a failed page keeps both too).
      expect(
        tags(html, 'meta')
          .filter((tag) => tag['name'] === 'theme-color')
          .map((tag) => [tag['media'], tag['content']]),
      ).toEqual([
        ['(prefers-color-scheme: light)', SITE.themeColor.light],
        ['(prefers-color-scheme: dark)', SITE.themeColor.dark],
      ]);

      // Indexable, canonical to itself, absolute, same origin as the site.
      expect(metaContent(html, 'name', 'robots')).toContain('index');
      expect(metaContent(html, 'name', 'robots')).not.toContain('noindex');
      expect(canonical(html)).toBe(`${baseURL}${item.path}`);

      // Both languages and x-default; the page lists itself.
      const alt = alternates(html);
      expect(Object.keys(alt).toSorted()).toEqual(
        [...LOCALES.map((locale) => LANGUAGES[locale].hreflang), 'x-default'].toSorted(),
      );
      expect(alt[item.hreflang]).toBe(`${baseURL}${item.path}`);
      expect(alt['x-default']).toBe(
        `${baseURL}${item.path.replace(`/${item.language}`, `/${DEFAULT_LOCALE}`)}`,
      );

      // Share tags.
      expect(metaContent(html, 'property', 'og:title')).toBe(titles(html)[0]);
      expect(metaContent(html, 'property', 'og:url')).toBe(`${baseURL}${item.path}`);
      expect(metaContent(html, 'property', 'og:locale')).toBe(item.ogLocale);
      expect(metaContent(html, 'property', 'og:image')).toBe(`${baseURL}/og-default.png`);
      expect(metaContent(html, 'property', 'og:image:width')).toBe('1200');
      expect(metaContent(html, 'property', 'og:image:height')).toBe('630');
      expect(metaContent(html, 'name', 'twitter:card')).toBe('summary_large_image');
      expect(allMeta(html, 'property', 'og:title')).toHaveLength(1);

      // Structured data parses and is typed.
      const blocks = jsonLd(html);
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        expect(block['@context']).toBe('https://schema.org');
        expect(typeof block['@type']).toBe('string');
      }
    });
  }
});

test.describe('across pages', () => {
  test('titles are unique within a language', async ({ request }) => {
    for (const language of LOCALES) {
      const seen = new Set<string>();
      for (const page of PAGES) {
        const html = await (await request.get(`/${language}${page.path}`)).text();
        const title = titles(html)[0] ?? '';
        expect(seen.has(title), `duplicate title "${title}" on /${language}${page.path}`).toBe(
          false,
        );
        seen.add(title);
      }
    }
  });

  test('a page and its other-language version point at each other', async ({ request }) => {
    for (const page of PAGES) {
      const htmls = await Promise.all(
        LOCALES.map(async (locale) => (await request.get(`/${locale}${page.path}`)).text()),
      );
      for (const [index, locale] of LOCALES.entries()) {
        const own = alternates(htmls[index] ?? '');
        for (const [otherIndex, other] of LOCALES.entries()) {
          expect(own[LANGUAGES[other].hreflang], `${locale} to ${other} on ${page.path}`).toBe(
            canonical(htmls[otherIndex] ?? ''),
          );
        }
      }
    }
  });

  test('tracking parameters do not change the canonical', async ({ request, baseURL }) => {
    const html = await (await request.get('/en/about?utm_source=newsletter&x=1')).text();
    expect(canonical(html)).toBe(`${baseURL}/en/about`);
  });

  test('the article carries Article and BreadcrumbList data and its publish date', async ({
    request,
  }) => {
    const html = await (await request.get(`/en/news/${ARTICLE.slug}`)).text();
    const types = jsonLd(html).map((block) => block['@type']);
    expect(types).toEqual(expect.arrayContaining(['Article', 'BreadcrumbList']));
    expect(metaContent(html, 'property', 'og:type')).toBe('article');
    expect(metaContent(html, 'property', 'article:published_time')).toBe(ARTICLE.date);
    // Google rejects an SVG as the article image: the covers are SVG here, so a raster file must be named.
    const article = jsonLd(html).find((block) => block['@type'] === 'Article');
    expect(String(article?.['image'])).toMatch(/.(png|jpe?g|webp|gif|avif)$/i);
  });

  test('the home page carries Organization and WebSite data', async ({ request }) => {
    const html = await (await request.get('/ar')).text();
    const types = jsonLd(html).map((block) => block['@type']);
    expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite']));
  });

  test('every internal link in the server HTML stays inside a language prefix and returns 200', async ({
    request,
  }) => {
    const html = await (await request.get('/en')).text();
    const links = new Set(
      tags(html, 'a')
        .map((tag) => tag['href'] ?? '')
        .filter((href) => href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/#')),
    );
    expect(links.size).toBeGreaterThan(5);
    for (const href of links) {
      expect(href, 'internal links are language-prefixed').toMatch(
        new RegExp(`^/(${LOCALES.join('|')})(/|$)`),
      );
      const response = await request.get(href, { maxRedirects: 0 });
      expect(response.status(), href).toBe(200);
    }
  });
});
