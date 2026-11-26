import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDeleteDialog } from './use-delete-dialog';

interface Row {
  id: string;
  name: string;
}

function setup() {
  const mutate = vi.fn();
  const view = renderHook(() =>
    useDeleteDialog<Row>({ isPending: false, mutate }, (row) => row.name),
  );
  act(() => {
    view.result.current.openDelete({ id: 'a', name: 'Alpha' });
  });
  return { ...view, mutate };
}

describe('useDeleteDialog', () => {
  it('sends one delete for several confirms before the next render', () => {
    const { result, mutate } = setup();

    act(() => {
      result.current.dialog.onConfirm();
      result.current.dialog.onConfirm();
      result.current.dialog.onConfirm();
    });

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]?.[0]).toBe('a');
  });

  it('allows a new confirm once the request settled', () => {
    const settled: (() => void)[] = [];
    const mutate = vi.fn(
      (_id: string, options?: { onSettled?: () => void }) => {
        if (options?.onSettled) {
          settled.push(options.onSettled);
        }
      },
    );
    const { result } = renderHook(() =>
      useDeleteDialog<Row>({ isPending: false, mutate }, (row) => row.name),
    );
    act(() => {
      result.current.openDelete({ id: 'a', name: 'Alpha' });
    });
    act(() => {
      result.current.dialog.onConfirm();
    });

    act(() => {
      settled[0]?.();
      result.current.dialog.onConfirm();
    });

    expect(mutate).toHaveBeenCalledTimes(2);
  });
});
