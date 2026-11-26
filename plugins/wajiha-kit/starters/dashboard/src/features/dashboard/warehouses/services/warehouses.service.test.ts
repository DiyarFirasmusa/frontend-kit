import { describe, expect, it } from 'vitest';
import { toWarehouseListParams } from '../utils/list-params';
import { defaultWarehouseSearch } from '../validations/search';
import { toWarehouseListQuery } from './warehouses.service';

describe('toWarehouseListQuery', () => {
  it('sends 0-based paging and leaves default filters out', () => {
    expect(
      toWarehouseListQuery(toWarehouseListParams(defaultWarehouseSearch)),
    ).toEqual({ page: 0, size: 10 });
  });

  it('maps sort, search, status and type to the backend names', () => {
    expect(
      toWarehouseListQuery({
        page: 2,
        pageSize: 20,
        sort: 'locationCount.desc',
        q: 'bgd',
        status: 'inactive',
        type: 'transit',
      }),
    ).toEqual({
      page: 1,
      size: 20,
      sort: 'locationCount,desc',
      q: 'bgd',
      isActive: false,
      isTransit: true,
    });
  });

  it('sends isTransit=false for the regular type', () => {
    expect(
      toWarehouseListQuery({
        ...toWarehouseListParams(defaultWarehouseSearch),
        type: 'regular',
      }),
    ).toMatchObject({ isTransit: false });
  });
});
