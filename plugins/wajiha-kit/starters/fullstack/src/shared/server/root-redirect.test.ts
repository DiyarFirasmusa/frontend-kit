import { describe, expect, it } from 'vitest';
import { chooseLocale, redirectToLocale } from './root-redirect';

const request = (headers: Record<string, string> = {}, path = '/') =>
  new Request(`https://example.test${path}`, { headers });

describe('chooseLocale', () => {
  it('prefers the saved cookie over the browser language', () => {
    expect(chooseLocale(request({ cookie: 'a=b; lang=en', 'accept-language': 'ar' }))).toBe('en');
  });

  it('falls back to Accept-Language, then to Arabic', () => {
    expect(chooseLocale(request({ 'accept-language': 'en-US,en;q=0.9' }))).toBe('en');
    expect(chooseLocale(request({ 'accept-language': 'fr' }))).toBe('ar');
    expect(chooseLocale(request())).toBe('ar');
  });

  it('ignores a cookie with an unsupported value', () => {
    expect(chooseLocale(request({ cookie: 'lang=fr', 'accept-language': 'en' }))).toBe('en');
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
