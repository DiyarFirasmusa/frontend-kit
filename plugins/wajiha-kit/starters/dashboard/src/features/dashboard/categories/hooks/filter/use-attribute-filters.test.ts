import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAttributeFilters } from './use-attribute-filters';

describe('useAttributeFilters', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty params that omit every field', () => {
    const { result } = renderHook(() => useAttributeFilters());
    expect(result.current.params).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it('maps status to isActive and includes dataType', () => {
    const { result } = renderHook(() => useAttributeFilters());

    act(() => {
      result.current.setStatus('ACTIVE');
      result.current.setDataType('OPTION');
    });
    expect(result.current.params).toEqual({
      dataType: 'OPTION',
      isActive: true,
    });

    act(() => {
      result.current.setStatus('INACTIVE');
    });
    expect(result.current.params).toEqual({
      dataType: 'OPTION',
      isActive: false,
    });
  });

  it('debounces the search term by 400ms and trims it', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAttributeFilters());

    act(() => {
      result.current.setSearch('  col ');
    });
    expect(result.current.params).toEqual({});
    expect(result.current.isDirty).toBe(true);

    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(result.current.params).toEqual({});

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.params).toEqual({ q: 'col' });
  });

  it('clearing a non-empty search updates params without waiting', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAttributeFilters());

    act(() => {
      result.current.setSearch('col');
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.params).toEqual({ q: 'col' });

    act(() => {
      result.current.setSearch('');
    });
    expect(result.current.params).toEqual({});
  });

  it('clear resets every filter and marks the state clean', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAttributeFilters());

    act(() => {
      result.current.setSearch('color');
      result.current.setDataType('TEXT');
      result.current.setStatus('INACTIVE');
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.clear();
    });
    expect(result.current.search).toBe('');
    expect(result.current.dataType).toBe('');
    expect(result.current.status).toBe('');
    expect(result.current.isDirty).toBe(false);

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.params).toEqual({});
  });
});
