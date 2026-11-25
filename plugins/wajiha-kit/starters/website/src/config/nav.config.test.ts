import { describe, expect, it } from 'vitest';
import { NAV } from './nav.config';

describe('NAV', () => {
  it('keeps path and route id in step', () => {
    for (const item of NAV) {
      expect(item.to).toBe(item.path === '' ? '/$locale' : `/$locale${item.path}`);
    }
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
