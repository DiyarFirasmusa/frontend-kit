import { describe, expect, it } from 'vitest';
import { SEARCH_RESPONSE } from '../topbar-test-utils';
import { buildSearchOptions, groupSearchOptions } from './search-options';

describe('buildSearchOptions', () => {
  it('returns nothing without data', () => {
    expect(buildSearchOptions()).toEqual([]);
  });

  it('lists warehouses, suppliers, categories and units in that order', () => {
    const options = buildSearchOptions(SEARCH_RESPONSE);
    expect(options.map((o) => o.group)).toEqual([
      'warehouses',
      'suppliers',
      'categories',
      'units',
    ]);
    expect(options[0]).toMatchObject({
      title: 'Central warehouse',
      subtitle: 'BGD-01',
      inactive: false,
    });
  });

  it('marks an inactive record', () => {
    const options = buildSearchOptions(SEARCH_RESPONSE);
    expect(options.find((o) => o.group === 'categories')?.inactive).toBe(true);
  });
});

describe('groupSearchOptions', () => {
  it('keeps the flat index of each option and drops empty groups', () => {
    const options = buildSearchOptions({
      ...SEARCH_RESPONSE,
      suppliers: [],
    });
    const sections = groupSearchOptions(options);
    expect(sections.map((s) => s.group)).toEqual([
      'warehouses',
      'categories',
      'units',
    ]);
    expect(sections[1]?.options[0]?.index).toBe(1);
  });
});
