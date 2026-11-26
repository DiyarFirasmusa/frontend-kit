import { describe, expect, it } from 'vitest';
import { defaultSupplierSearch, supplierSearchSchema } from './search';

describe('supplierSearchSchema', () => {
  it('fills every default for an empty URL', () => {
    expect(defaultSupplierSearch).toEqual({
      page: 1,
      pageSize: 10,
      sort: '',
      q: '',
      status: 'all',
    });
  });

  it('keeps a numeric search text as a string', () => {
    expect(supplierSearchSchema.parse({ q: 100553 }).q).toBe('100553');
  });

  it('falls back on bad values instead of throwing', () => {
    expect(
      supplierSearchSchema.parse({
        page: -3,
        pageSize: 7,
        status: 'archived',
        sort: 42,
      }),
    ).toEqual(defaultSupplierSearch);
  });

  it('parses a shared link', () => {
    expect(
      supplierSearchSchema.parse({
        page: '3',
        pageSize: '20',
        sort: 'name.desc',
        q: ' demo ',
        status: 'inactive',
      }),
    ).toEqual({
      page: 3,
      pageSize: 20,
      sort: 'name.desc',
      q: 'demo',
      status: 'inactive',
    });
  });
});
