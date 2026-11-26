import { describe, expect, it } from 'vitest';
import {
  defaultUnitOfMeasureSearch,
  unitOfMeasureSearchSchema,
} from './search';

describe('unitOfMeasureSearchSchema', () => {
  it('fills every default for an empty URL', () => {
    expect(defaultUnitOfMeasureSearch).toEqual({
      page: 1,
      pageSize: 10,
      sort: '',
      q: '',
      status: 'all',
      decimals: 'all',
    });
  });

  it('keeps a numeric search text as a string', () => {
    expect(unitOfMeasureSearchSchema.parse({ q: 100553 }).q).toBe('100553');
  });

  it('accepts decimals as the number the router parses from ?decimals=2', () => {
    expect(unitOfMeasureSearchSchema.parse({ decimals: 2 }).decimals).toBe('2');
    expect(unitOfMeasureSearchSchema.parse({ decimals: '0' }).decimals).toBe(
      '0',
    );
  });

  it('falls back on bad values instead of throwing', () => {
    expect(
      unitOfMeasureSearchSchema.parse({
        page: -3,
        pageSize: 7,
        status: 'archived',
        decimals: 9,
        sort: 42,
      }),
    ).toEqual(defaultUnitOfMeasureSearch);
  });

  it('parses a shared link', () => {
    expect(
      unitOfMeasureSearchSchema.parse({
        page: '3',
        pageSize: '20',
        sort: 'name.desc',
        q: ' kg ',
        status: 'inactive',
        decimals: '3',
      }),
    ).toEqual({
      page: 3,
      pageSize: 20,
      sort: 'name.desc',
      q: 'kg',
      status: 'inactive',
      decimals: '3',
    });
  });
});
