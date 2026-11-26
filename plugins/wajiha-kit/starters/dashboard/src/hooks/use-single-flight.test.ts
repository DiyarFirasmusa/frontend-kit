import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSingleFlight } from './use-single-flight';

describe('useSingleFlight', () => {
  it('lets only the first of several synchronous starts through', () => {
    const { result } = renderHook(() => useSingleFlight());

    const results = [
      result.current.start(),
      result.current.start(),
      result.current.start(),
    ];

    expect(results).toEqual([true, false, false]);
  });

  it('lets the next submit through once the request settled', () => {
    const { result } = renderHook(() => useSingleFlight());
    result.current.start();

    result.current.end();

    expect(result.current.start()).toBe(true);
  });

  it('keeps the same guard across renders', () => {
    const { result, rerender } = renderHook(() => useSingleFlight());
    const first = result.current;
    first.start();

    rerender();

    expect(result.current).toBe(first);
    expect(result.current.start()).toBe(false);
  });
});
