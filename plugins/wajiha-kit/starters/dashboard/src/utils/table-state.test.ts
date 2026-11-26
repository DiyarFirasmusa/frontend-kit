import { describe, expect, it } from 'vitest';
import {
  toBackendSort,
  toPaginationState,
  toSortingState,
  toSortParam,
  toTableStatus,
} from './table-state';

describe('table state', () => {
  it('converts the 1-based URL page to the 0-based table index', () => {
    expect(toPaginationState(3, 20)).toEqual({ pageIndex: 2, pageSize: 20 });
  });

  it('reads and writes the URL sort', () => {
    expect(toSortingState('name.desc')).toEqual([{ id: 'name', desc: true }]);
    expect(toSortingState('name')).toEqual([]);
    expect(toSortingState('name.up')).toEqual([]);
    expect(toSortParam([{ id: 'code', desc: false }])).toBe('code.asc');
    expect(toSortParam([])).toBe('');
  });

  it('maps the URL sort to the Spring sort parameter', () => {
    expect(toBackendSort('code.desc')).toBe('code,desc');
    expect(toBackendSort('')).toBeUndefined();
  });

  it('derives the table status from the query', () => {
    const base = { isPending: false, isError: false, isFetching: false };
    expect(toTableStatus({ ...base, isPending: true })).toBe('loading');
    expect(toTableStatus({ ...base, isError: true })).toBe('error');
    expect(toTableStatus({ ...base, isFetching: true })).toBe('refetching');
    expect(toTableStatus(base)).toBe('ready');
  });
});
