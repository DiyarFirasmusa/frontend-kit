import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePagination } from './use-pagination';

describe('usePagination', () => {
  it('starts on page 0 with skip/take derived from the page size', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20 }));
    expect(result.current.page).toBe(0);
    expect(result.current.skip).toBe(0);
    expect(result.current.take).toBe(20);
  });

  it('moves skip when the page changes and resets to 0', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));
    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.skip).toBe(30);
    act(() => {
      result.current.reset();
    });
    expect(result.current.page).toBe(0);
  });

  it('builds a ServerPagination object with at least one page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));
    expect(result.current.toTablePagination(0).totalPages).toBe(1);
    expect(result.current.toTablePagination(25).totalPages).toBe(3);
    expect(result.current.toTablePagination(25).total).toBe(25);
  });
});
