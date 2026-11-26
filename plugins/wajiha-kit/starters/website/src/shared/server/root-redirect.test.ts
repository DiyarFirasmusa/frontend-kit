import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LANGUAGES, LOCALES } from '@/shared/lib/i18n/languages';
import { chooseLocale, redirectToLocale } from './root-redirect';

// Not a real language code: it stays unsupported when a real language is added to LOCALES.
const UNSUPPORTED = 'zz';

const request = (headers: Record<string, string> = {}, path = '/') =>
  new Request(`https://example.test${path}`, { headers });

describe('chooseLocale', () => {
  it('prefers the saved cookie over the browser language', () => {
    expect(chooseLocale(request({ cookie: 'a=b; lang=en', 'accept-language': 'ar' }))).toBe('en');
  });

  it('falls back to Accept-Language, then to the default language', () => {
    for (const locale of LOCALES) {
      expect(chooseLocale(request({ 'accept-language': LANGUAGES[locale].hreflang }))).toBe(locale);
    }
    expect(chooseLocale(request({ 'accept-language': UNSUPPORTED }))).toBe(DEFAULT_LOCALE);
    expect(chooseLocale(request())).toBe(DEFAULT_LOCALE);
  });

  it('ignores a cookie with an unsupported value', () => {
    expect(chooseLocale(request({ cookie: `lang=${UNSUPPORTED}`, 'accept-language': 'en' }))).toBe(
      'en',
    );
  });
});

describe('redirectToLocale', () => {
  it('is a temporary redirect to the language home and tells caches it varies', () => {
    const response = redirectToLocale(request({ 'accept-language': 'en' }));
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/en');
    expect(response.headers.get('vary')).toContain('Accept-Language');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('keeps the query string (campaign tags)', () => {
    expect(redirectToLocale(request({}, '/?utm_source=x')).headers.get('location')).toBe(
      '/ar?utm_source=x',
    );
  });
});
