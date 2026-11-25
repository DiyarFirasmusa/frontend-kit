import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCan } from '@/components/auth/can';
import type { Permission } from '@/constants/permissions';
import { PERMS } from '@/constants/permissions';
import { BarChart } from '@/lib/icons';
import { usePermissionStore } from '@/store/permission-store';
import type { NavItem } from '../types/types';
import { isItemActive, itemMatchLength } from './use-sidebar';

const item = (to: string, permission?: Permission): NavItem => ({
  to,
  labelKey: 'nav.items',
  icon: BarChart,
  permission,
});

describe('isItemActive', () => {
  it('matches exact and nested paths', () => {
    expect(isItemActive(item('/items'), '/items')).toBe(true);
    expect(isItemActive(item('/items'), '/items/abc')).toBe(true);
    expect(isItemActive(item('/items'), '/itemsx')).toBe(false);
  });

  it('matches the home item only on the root path', () => {
    expect(isItemActive(item('/'), '/')).toBe(true);
    expect(isItemActive(item('/'), '/items')).toBe(false);
    expect(
      isItemActive(
        { ...item('/stock/valuation'), matches: ['/stock/landed-costs'] },
        '/stock/landed-costs',
      ),
    ).toBe(true);
    expect(itemMatchLength(item('/items'), '/items/abc')).toBe(6);
    expect(itemMatchLength(item('/items'), '/other')).toBe(-1);
  });
});

describe('useCan', () => {
  beforeEach(() => {
    usePermissionStore.setState({ roles: [], permissions: [] });
  });

  it('denies a permission the user does not hold', () => {
    const { result } = renderHook(() => useCan(PERMS.supplier.read));
    expect(result.current).toBe(false);
  });

  it('grants a held permission', () => {
    usePermissionStore.setState({ permissions: [PERMS.supplier.read] });
    const { result } = renderHook(() => useCan(PERMS.supplier.read));
    expect(result.current).toBe(true);
  });

  it('grants every permission to a SUPERADMIN', () => {
    usePermissionStore.setState({ permissions: [], roles: ['SUPERADMIN'] });
    const { result } = renderHook(() => useCan(PERMS.supplier.read));
    expect(result.current).toBe(true);
  });

  it('re-renders when the permissions change in the store', () => {
    const { result } = renderHook(() => useCan(PERMS.supplier.read));
    expect(result.current).toBe(false);
    act(() => {
      usePermissionStore.setState({ permissions: [PERMS.supplier.read] });
    });
    expect(result.current).toBe(true);
  });
});
