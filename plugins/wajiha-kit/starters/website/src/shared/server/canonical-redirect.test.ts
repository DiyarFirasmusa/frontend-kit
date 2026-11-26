import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES } from '@/shared/lib/i18n/languages';
import { canonicalRedirectIfExists, type CanonicalSite } from './canonical-redirect';

// A fake site: two static pages and one slug route, whatever the real NAV and articles are.
const STORED = ['Plan-It', 'q4-plan', 'مقال'];
const SITE: CanonicalSite = {
  staticSegments: new Set(['about', 'news']),
  pagePaths: new Set(['', '/about', '/news']),
  slugRoutes: {
    news: async (slug) =>
      STORED.find((stored) => stored === slug) ??
      STORED.find((stored) => stored.toLowerCase() === slug.toLowerCase()),
  },
};
const LANG = DEFAULT_LOCALE;

const go = (path: string, method = 'GET') =>
  canonicalRedirectIfExists(new URL(`https://example.test${path}`), method, SITE);

describe('canonicalRedirectIfExists: redirects only to a page that exists', () => {
  it('fixes the case and slashes of a real page in one hop, keeping the query', async () => {
    expect(await go(`/${LANG.toUpperCase()}/About`)).toBe(`/${LANG}/about`);
    expect(await go(`/${LANG}/about/`)).toBe(`/${LANG}/about`);
    expect(await go(`/${LANG.toUpperCase()}/NEWS/?page=2`)).toBe(`/${LANG}/news?page=2`);
    expect(await go(`/${LANG.toUpperCase()}//About//`)).toBe(`/${LANG}/about`);
    expect(await go('//')).toBe('/');
  });

  it('works for every language in the registry', async () => {
    for (const locale of LOCALES) {
      expect(await go(`/${locale.toUpperCase()}`)).toBe(`/${locale}`);
      expect(await go(`/${locale.toUpperCase()}/About/`)).toBe(`/${locale}/about`);
    }
  });

  it('matches a slug ignoring case and redirects to its stored spelling, in one hop', async () => {
    expect(await go(`/${LANG}/news/PLAN-IT`)).toBe(`/${LANG}/news/Plan-It`);
    expect(await go(`/${LANG}/news/plan-it`)).toBe(`/${LANG}/news/Plan-It`);
    expect(await go(`/${LANG.toUpperCase()}/NEWS/Q4-PLAN/`)).toBe(`/${LANG}/news/q4-plan`);
    expect(await go(`/${LANG}/news/Q4-Plan?x=1`)).toBe(`/${LANG}/news/q4-plan?x=1`);
  });

  it('leaves a slug that is already in its stored spelling alone', async () => {
    expect(await go(`/${LANG}/news/Plan-It`)).toBeUndefined();
    expect(await go(`/${LANG}/news/q4-plan`)).toBeUndefined();
  });

  it('an encoded slug is decoded to match, and redirected to the uppercase-hex spelling', async () => {
    const canonical = `/${LANG}/news/%D9%85%D9%82%D8%A7%D9%84`;
    expect(await go(`/${LANG}/news/%d9%85%d9%82%d8%a7%d9%84`)).toBe(canonical);
    expect(await go(canonical)).toBeUndefined();
    expect(await go(`/${LANG}/news/مقال`)).toBeUndefined();
  });

  it('never redirects to a URL that would answer 404: it says nothing and the router answers 404', async () => {
    for (const path of [
      `/${LANG.toUpperCase()}/nothing/`,
      `/${LANG}/Nothing`,
      `/${LANG.toUpperCase()}/NEWS/NO-SUCH-SLUG/`,
      `/${LANG}/news/No-Such-Slug`,
      `/${LANG}/news/plan-it/extra`,
      `/${LANG}/about/extra/`,
      `/zz/about/`,
      `/ZZ/About`,
      `/${LANG}/news/%zz`,
      `/${LANG}/news/plan-it%20`,
      `/%5Cevil.example/`,
    ]) {
      expect(await go(path), path).toBeUndefined();
    }
  });

  it('never answers with a protocol-relative Location (another host)', async () => {
    for (const path of [
      '//evil.example/',
      '///Evil/x',
      '/.//evil.example/',
      `/${LANG}//evil.example`,
    ]) {
      const target = await go(path);
      expect(target === undefined || !target.startsWith('//'), path).toBe(true);
    }
  });

  it('only redirects GET and HEAD, and leaves assets, files and server functions alone', async () => {
    expect(await go(`/${LANG.toUpperCase()}/about/`, 'HEAD')).toBe(`/${LANG}/about`);
    expect(await go(`/${LANG.toUpperCase()}/about/`, 'POST')).toBeUndefined();
    expect(await go('/assets/Styles-AbC123.css')).toBeUndefined();
    expect(await go('/_serverFn/AbCdEf')).toBeUndefined();
    expect(await go('/Favicon.SVG')).toBeUndefined();
  });

  it('a path that is already canonical, and the root, get nothing', async () => {
    expect(await go(`/${LANG}`)).toBeUndefined();
    expect(await go(`/${LANG}/about`)).toBeUndefined();
    expect(await go('/')).toBeUndefined();
  });

  it('a slug route is looked up only under its own parent segment', async () => {
    expect(await go(`/${LANG}/about/PLAN-IT`)).toBeUndefined();
    expect(await go(`/${LANG}/constructor/x`)).toBeUndefined();
  });
});
