import { describe, expect, it } from 'vitest';
import { parseSuppliersSearch } from './supplier-search';

describe('parseSuppliersSearch', () => {
  it('keeps a search, a known status and a page after the first', () => {
    expect(parseSuppliersSearch({ q: ' cedar ', status: 'inactive', page: 3 })).toEqual({
      q: 'cedar',
      status: 'inactive',
      page: 3,
    });
  });

  it('drops empty, unknown and broken values', () => {
    expect(parseSuppliersSearch({ q: '  ', status: 'deleted', page: 'abc' })).toEqual({});
    expect(parseSuppliersSearch({ page: 1 })).toEqual({});
    expect(parseSuppliersSearch({ page: 2.5 })).toEqual({});
    expect(parseSuppliersSearch({ page: -4 })).toEqual({});
  });

  it('caps a very long search', () => {
    expect(parseSuppliersSearch({ q: 'x'.repeat(500) }).q).toHaveLength(100);
  });
});
