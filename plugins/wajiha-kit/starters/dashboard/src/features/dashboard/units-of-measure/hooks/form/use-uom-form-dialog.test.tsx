import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { createTestQueryClient } from '@/test/render';
import { makeUnitOfMeasure } from '../../uom-test-utils';
import { defaultUnitOfMeasureForm } from '../../validations/validations';
import { useUnitOfMeasureFormDialog } from './use-uom-form-dialog';

function setup() {
  const queryClient = createTestQueryClient();
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return renderHook(() => useUnitOfMeasureFormDialog(), { wrapper });
}

describe('useUnitOfMeasureFormDialog', () => {
  it('starts closed with the default form values', () => {
    const { result } = setup();
    expect(result.current.open).toBe(false);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.form.getValues()).toEqual(defaultUnitOfMeasureForm);
  });

  it('openEdit populates the form from the row and opens the dialog', () => {
    const { result } = setup();
    act(() => {
      result.current.openEdit(
        makeUnitOfMeasure({
          code: 'KG',
          name: 'Kilogram',
          decimalPlaces: 2,
          isActive: false,
        }),
      );
    });
    expect(result.current.open).toBe(true);
    expect(result.current.isEditing).toBe(true);
    expect(result.current.form.getValues()).toEqual({
      code: 'KG',
      name: 'Kilogram',
      decimalPlaces: '2',
      isActive: false,
    });
  });

  it('closing resets the values, clears editing and closes', () => {
    const { result } = setup();
    act(() => {
      result.current.openEdit(makeUnitOfMeasure({ decimalPlaces: 2 }));
    });
    act(() => {
      result.current.onOpenChange(false);
    });
    expect(result.current.open).toBe(false);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.form.getValues()).toEqual(defaultUnitOfMeasureForm);
  });

  it('keeps submit enabled on an empty create form so validation can run', () => {
    const { result } = setup();
    act(() => {
      result.current.openCreate();
    });
    expect(result.current.form.formState.isValid).toBe(false);
    expect(result.current.canSubmit).toBe(true);
  });

  it('openCreate resets to defaults and opens without editing', () => {
    const { result } = setup();
    act(() => {
      result.current.openEdit(makeUnitOfMeasure());
    });
    act(() => {
      result.current.openCreate();
    });
    expect(result.current.open).toBe(true);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.form.getValues()).toEqual(defaultUnitOfMeasureForm);
  });
});
