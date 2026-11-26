import { describe, expect, it } from 'vitest';
import { attributeSearchSchema, defaultAttributeSearch } from './search';

describe('attributeSearchSchema', () => {
  it('fills every default for an empty URL', () => {
    expect(defaultAttributeSearch).toEqual({
      page: 1,
      pageSize: 10,
      sort: '',
      q: '',
      dataType: 'all',
      status: 'all',
    });
  });

  it('keeps a numeric search text as a string', () => {
    expect(attributeSearchSchema.parse({ q: 100553 }).q).toBe('100553');
  });

  it('falls back on bad values instead of throwing', () => {
    expect(
      attributeSearchSchema.parse({
        page: 0,
        pageSize: 7,
        dataType: 'COLOR',
        status: 'archived',
        sort: 42,
      }),
    ).toEqual(defaultAttributeSearch);
  });

  it('parses a shared link', () => {
    expect(
      attributeSearchSchema.parse({
        page: '2',
        pageSize: '20',
        sort: 'name.desc',
        q: ' col ',
        dataType: 'OPTION',
        status: 'inactive',
      }),
    ).toEqual({
      page: 2,
      pageSize: 20,
      sort: 'name.desc',
      q: 'col',
      dataType: 'OPTION',
      status: 'inactive',
    });
  });
});
