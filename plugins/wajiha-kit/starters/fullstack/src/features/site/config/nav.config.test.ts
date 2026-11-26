import { describe, expect, it } from 'vitest';
import { NAV, navItem } from './nav.config';

describe('NAV', () => {
  it('works out the language-free path and the id from the route', () => {
    expect(
      navItem({ to: '/$locale/about', labelKey: 'nav.about', changefreq: 'yearly', priority: 0.5 }),
    ).toMatchObject({ id: 'about', path: '/about' });
    expect(
      navItem({ to: '/$locale', labelKey: 'nav.home', changefreq: 'yearly', priority: 1 }),
    ).toMatchObject({ id: 'home', path: '' });
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
});
