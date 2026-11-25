import { describe, expect, it } from 'vitest';
import { toWarehouseListParams } from './warehouse-params';

describe('toWarehouseListParams', () => {
  it('omits empty filters', () => {
    expect(
      toWarehouseListParams({ q: '  ', isActive: '', isTransit: '' }),
    ).toEqual({ q: undefined, isActive: undefined, isTransit: undefined });
  });

  it('trims the search and maps the flags to booleans', () => {
    expect(
      toWarehouseListParams({
        q: ' erbil ',
        isActive: 'false',
        isTransit: 'true',
      }),
    ).toEqual({ q: 'erbil', isActive: false, isTransit: true });
  });
});
