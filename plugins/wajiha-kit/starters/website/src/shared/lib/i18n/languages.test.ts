import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  directionOf,
  isLocale,
  localeFromPath,
  negotiateLocale,
  otherLocale,
  swapLocaleInPath,
  toLocale,
} from './languages';

describe('languages', () => {
  it('Arabic is the default and right-to-left; English is left-to-right', () => {
    expect(DEFAULT_LOCALE).toBe('ar');
    expect(directionOf('ar')).toBe('rtl');
    expect(directionOf('en')).toBe('ltr');
  });

  it('isLocale and toLocale only accept supported languages', () => {
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(toLocale('fr')).toBe('ar');
    expect(toLocale('en')).toBe('en');
  });

  it('otherLocale flips the language', () => {
    expect(otherLocale('ar')).toBe('en');
    expect(otherLocale('en')).toBe('ar');
  });

  it('localeFromPath reads the first segment only', () => {
    expect(localeFromPath('/ar/about')).toBe('ar');
    expect(localeFromPath('/en')).toBe('en');
    expect(localeFromPath('/about/ar')).toBeUndefined();
    expect(localeFromPath('/')).toBeUndefined();
  });

  it('swapLocaleInPath keeps the page and changes the language', () => {
    expect(swapLocaleInPath('/ar/news/some-slug', 'en')).toBe('/en/news/some-slug');
    expect(swapLocaleInPath('/en', 'ar')).toBe('/ar');
    expect(swapLocaleInPath('/zz/page', 'en')).toBe('/en');
  });

  describe('negotiateLocale', () => {
    it('respects q values', () => {
      expect(negotiateLocale('en;q=0.5, ar;q=0.9')).toBe('ar');
      expect(negotiateLocale('en-US,en;q=0.9,ar;q=0.8')).toBe('en');
    });

    it('matches a regional tag by its language', () => {
      expect(negotiateLocale('ar-IQ')).toBe('ar');
      expect(negotiateLocale('EN-gb')).toBe('en');
    });

    it('ignores unsupported languages and zero weights', () => {
      expect(negotiateLocale('fr-FR,de;q=0.8')).toBeUndefined();
      expect(negotiateLocale('ar;q=0, en;q=0.1')).toBe('en');
    });

    it('returns undefined for no header', () => {
      expect(negotiateLocale(null)).toBeUndefined();
      expect(negotiateLocale('')).toBeUndefined();
    });
  });
});
