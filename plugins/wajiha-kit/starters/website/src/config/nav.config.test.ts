import { describe, expect, it } from 'vitest';
import { getFixedT } from '@/shared/lib/i18n/create-i18n';
import { LOCALES } from '@/shared/lib/i18n/languages';
import { NAV, navItem, navItemFor, PAGE_SEGMENTS } from './nav.config';

describe('NAV', () => {
  it('works out the language-free path and the id from the route', () => {
    const keys = {
      labelKey: 'nav.about',
      metaTitleKey: 'about.metaTitle',
      metaDescriptionKey: 'about.metaDescription',
      changefreq: 'yearly',
      priority: 0.5,
    } as const;
    expect(navItem({ to: '/$locale/about', ...keys })).toMatchObject({
      id: 'about',
      path: '/about',
    });
    expect(navItem({ to: '/$locale', ...keys })).toMatchObject({ id: 'home', path: '' });
  });

  it('uses lowercase kebab-case paths and unique ids', () => {
    for (const item of NAV) {
      expect(item.path).toMatch(/^(|\/[a-z0-9]+(-[a-z0-9]+)*)$/);
    }
    expect(new Set(NAV.map((item) => item.id)).size).toBe(NAV.length);
  });

  it('priorities are between 0 and 1', () => {
    for (const item of NAV) {
      expect(item.priority).toBeGreaterThan(0);
      expect(item.priority).toBeLessThanOrEqual(1);
    }
  });

  it('every label and meta key exists in every language', () => {
    for (const locale of LOCALES) {
      const t = getFixedT(locale);
      for (const item of NAV) {
        for (const key of [item.labelKey, item.metaTitleKey, item.metaDescriptionKey]) {
          expect(t(key), `${locale} ${key}`).not.toBe(key);
        }
      }
    }
  });

  it('navItemFor finds an entry and refuses a route that is not in NAV', () => {
    expect(navItemFor('/$locale/contact').id).toBe('contact');
    // The one deliberately wrong route: the type would refuse it at compile time.
    expect(() => navItemFor('/$locale/nope' as never)).toThrow(/not in NAV/);
  });
});

describe('PAGE_SEGMENTS', () => {
  it('holds the static segments of NAV: what canonicalRedirect lowercases', () => {
    expect([...PAGE_SEGMENTS].toSorted()).toEqual(['about', 'contact', 'news', 'services']);
  });
});
