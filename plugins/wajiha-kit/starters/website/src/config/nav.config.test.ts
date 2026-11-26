import { describe, expect, it } from 'vitest';
import { getFixedT } from '@/shared/lib/i18n/create-i18n';
import { LOCALES } from '@/shared/lib/i18n/languages';
import { NAV, navItem, navItemFor, PAGE_PATHS, PAGE_SEGMENTS } from './nav.config';

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

// Both sets are worked out from NAV, so adding a page to NAV never needs an edit here.
describe('PAGE_SEGMENTS and PAGE_PATHS', () => {
  it('PAGE_SEGMENTS holds every static segment of NAV: what canonicalRedirect lowercases', () => {
    const expected = new Set(NAV.flatMap((item) => item.path.split('/').filter(Boolean)));
    expect(PAGE_SEGMENTS).toEqual(expected);
    expect(PAGE_SEGMENTS.size).toBeGreaterThan(0);
    for (const segment of PAGE_SEGMENTS) {
      expect(segment).toBe(segment.toLowerCase());
    }
  });

  it('PAGE_PATHS holds the language-free path of every NAV page, the home page included', () => {
    expect([...PAGE_PATHS].toSorted()).toEqual(NAV.map((item) => item.path).toSorted());
    expect(PAGE_PATHS.has('')).toBe(true);
  });
});
