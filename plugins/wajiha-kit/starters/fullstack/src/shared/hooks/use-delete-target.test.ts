import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDeleteTarget } from './use-delete-target';

describe('useDeleteTarget', () => {
  it('starts closed with no target', () => {
    const { result } = renderHook(() => useDeleteTarget<{ id: string }>());
    expect(result.current.deleteTarget).toBeNull();
    expect(result.current.isDeleteOpen).toBe(false);
  });

  it('opens with the row and closes without losing it', () => {
    const { result } = renderHook(() => useDeleteTarget<{ id: string }>());

    act(() => {
      result.current.openDelete({ id: 'a' });
    });
    expect(result.current.isDeleteOpen).toBe(true);
    expect(result.current.deleteTarget).toEqual({ id: 'a' });

    act(() => {
      result.current.closeDelete();
    });
    expect(result.current.isDeleteOpen).toBe(false);
    expect(result.current.deleteTarget).toEqual({ id: 'a' });
  });
});
