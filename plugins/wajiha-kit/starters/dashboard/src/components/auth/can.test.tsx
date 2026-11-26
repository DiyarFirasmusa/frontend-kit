import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PERMS } from '@/constants/permissions';
import { usePermissionStore } from '@/store/permission-store';
import { renderWithProviders, screen } from '@/test/render';
import { Can, useCan, useCanAny } from './can';

function grant(permissions: string[], roles: string[] = []): void {
  usePermissionStore.getState().setPermissions({ permissions, roles });
}

describe('<Can>', () => {
  beforeEach(() => {
    usePermissionStore.getState().clear();
  });

  it('renders children when the permission is held', () => {
    grant([PERMS.supplier.update]);
    renderWithProviders(
      <Can permission={PERMS.supplier.update}>
        <span>add supplier</span>
      </Can>,
    );
    expect(screen.getByText('add supplier')).toBeInTheDocument();
  });

  it('renders the fallback when the permission is missing', () => {
    grant([PERMS.supplier.view]);
    renderWithProviders(
      <Can permission={PERMS.supplier.update} fallback={<span>read only</span>}>
        <span>add supplier</span>
      </Can>,
    );
    expect(screen.queryByText('add supplier')).not.toBeInTheDocument();
    expect(screen.getByText('read only')).toBeInTheDocument();
  });

  it('renders nothing by default when denied', () => {
    renderWithProviders(
      <Can permission={PERMS.supplier.update}>
        <span>add supplier</span>
      </Can>,
    );
    expect(screen.queryByText('add supplier')).not.toBeInTheDocument();
  });

  it('anyOf passes with one of several permissions', () => {
    grant([PERMS.supplier.delete]);
    renderWithProviders(
      <Can anyOf={[PERMS.supplier.update, PERMS.supplier.delete]}>
        <span>manage</span>
      </Can>,
    );
    expect(screen.getByText('manage')).toBeInTheDocument();
  });

  it('SUPERADMIN passes every check', () => {
    grant([], ['SUPERADMIN']);
    renderWithProviders(
      <Can permission={PERMS.warehouse.delete}>
        <span>delete</span>
      </Can>,
    );
    expect(screen.getByText('delete')).toBeInTheDocument();
  });
});

describe('useCan()', () => {
  beforeEach(() => {
    usePermissionStore.getState().clear();
  });

  it('keeps the same checker while permissions do not change', () => {
    grant([PERMS.warehouse.view]);
    const { result, rerender } = renderHook(() => useCan());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    expect(first(PERMS.warehouse.view)).toBe(true);
  });

  it('re-renders with a new checker when permissions change', () => {
    grant([PERMS.warehouse.view]);
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useCan();
    });
    const before = result.current;
    expect(before(PERMS.warehouse.delete)).toBe(false);

    act(() => {
      grant([PERMS.warehouse.view, PERMS.warehouse.delete]);
    });

    expect(renders).toBe(2);
    expect(result.current).not.toBe(before);
    expect(result.current(PERMS.warehouse.delete)).toBe(true);
  });

  it('useCanAny follows the same SUPERADMIN rule', () => {
    grant([], ['SUPERADMIN']);
    const { result } = renderHook(() =>
      useCanAny([PERMS.supplier.update, PERMS.supplier.delete]),
    );
    expect(result.current).toBe(true);
  });
});
