import { describe, expect, it } from 'vitest';
import {
  defaultWarehouseDetailSearch,
  warehouseDetailSearchSchema,
} from '../pages/detail/validations/search';
import { defaultWarehouseSearch, warehouseSearchSchema } from './search';

describe('warehouseSearchSchema', () => {
  it('fills every default for an empty URL', () => {
    expect(defaultWarehouseSearch).toEqual({
      page: 1,
      pageSize: 10,
      sort: '',
      q: '',
      status: 'all',
      type: 'all',
    });
  });

  it('keeps a numeric search text as a string', () => {
    expect(warehouseSearchSchema.parse({ q: 100553 }).q).toBe('100553');
  });

  it('falls back on bad values instead of throwing', () => {
    expect(
      warehouseSearchSchema.parse({
        page: -3,
        pageSize: 7,
        status: 'archived',
        type: 'air',
        sort: 42,
      }),
    ).toEqual(defaultWarehouseSearch);
  });

  it('parses a shared link', () => {
    expect(
      warehouseSearchSchema.parse({
        page: '3',
        pageSize: '20',
        sort: 'name.desc',
        q: ' bgd ',
        status: 'inactive',
        type: 'transit',
      }),
    ).toEqual({
      page: 3,
      pageSize: 20,
      sort: 'name.desc',
      q: 'bgd',
      status: 'inactive',
      type: 'transit',
    });
  });
});

describe('warehouseDetailSearchSchema', () => {
  it('defaults to the overview tab', () => {
    expect(defaultWarehouseDetailSearch).toEqual({ tab: 'overview' });
  });

  it('keeps a known tab and falls back on an unknown one', () => {
    expect(warehouseDetailSearchSchema.parse({ tab: 'members' }).tab).toBe(
      'members',
    );
    expect(warehouseDetailSearchSchema.parse({ tab: 'billing' }).tab).toBe(
      'overview',
    );
    expect(warehouseDetailSearchSchema.parse({ tab: 7 }).tab).toBe('overview');
  });
});
