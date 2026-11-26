import { describe, expect, it } from 'vitest';
import { toSupplierListParams } from '../utils/list-params';
import { defaultSupplierSearch } from '../validations/search';
import { toSupplierListQuery } from './suppliers.service';

describe('toSupplierListQuery', () => {
  it('sends 0-based paging and leaves default filters out', () => {
    expect(
      toSupplierListQuery(toSupplierListParams(defaultSupplierSearch)),
    ).toEqual({ page: 0, size: 10 });
  });

  it('maps sort, search and status to the backend names', () => {
    expect(
      toSupplierListQuery({
        page: 3,
        pageSize: 20,
        sort: 'name.desc',
        q: 'demo',
        status: 'inactive',
      }),
    ).toEqual({
      page: 2,
      size: 20,
      sort: 'name,desc',
      q: 'demo',
      isActive: false,
    });
  });
});
