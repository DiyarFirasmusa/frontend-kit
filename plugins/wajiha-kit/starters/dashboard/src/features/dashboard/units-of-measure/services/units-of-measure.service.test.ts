import { describe, expect, it } from 'vitest';
import { toUnitOfMeasureListParams } from '../utils/list-params';
import { defaultUnitOfMeasureSearch } from '../validations/search';
import { toUnitOfMeasureListQuery } from './units-of-measure.service';

describe('toUnitOfMeasureListQuery', () => {
  it('sends 0-based paging and leaves default filters out', () => {
    expect(
      toUnitOfMeasureListQuery(
        toUnitOfMeasureListParams(defaultUnitOfMeasureSearch),
      ),
    ).toEqual({ page: 0, size: 10 });
  });

  it('maps sort, search, status and decimals to the backend names', () => {
    expect(
      toUnitOfMeasureListQuery({
        page: 3,
        pageSize: 20,
        sort: 'decimalPlaces.desc',
        q: 'kg',
        status: 'inactive',
        decimals: '3',
      }),
    ).toEqual({
      page: 2,
      size: 20,
      sort: 'decimalPlaces,desc',
      q: 'kg',
      isActive: false,
      decimalPlaces: 3,
    });
  });

  it('sends decimals 0, which is a real filter', () => {
    expect(
      toUnitOfMeasureListQuery({
        ...toUnitOfMeasureListParams(defaultUnitOfMeasureSearch),
        decimals: '0',
      }),
    ).toMatchObject({ decimalPlaces: 0 });
  });
});
