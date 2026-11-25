import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PERMS } from '@/constants/permissions';
import type { Permission } from '@/constants/permissions';
import {
  hasPermission,
  useHasPermission,
  usePermissionStore,
} from '@/store/permission-store';

const ALL_PERMISSIONS = Object.values(PERMS).flatMap((group) =>
  Object.values(group),
) as Permission[];

describe('usePermissionStore', () => {
  it('setPermissions stores roles and permissions', () => {
    usePermissionStore.getState().setPermissions({
      roles: ['ADMIN'],
      permissions: [PERMS.warehouse.read, PERMS.warehouse.write],
    });

    const state = usePermissionStore.getState();
    expect(state.roles).toEqual(['ADMIN']);
    expect(state.permissions).toEqual([
      PERMS.warehouse.read,
      PERMS.warehouse.write,
    ]);
  });

  it('clear() resets roles and permissions', () => {
    usePermissionStore.getState().setPermissions({
      roles: ['ADMIN'],
      permissions: [PERMS.warehouse.read],
    });
    usePermissionStore.getState().clear();

    const state = usePermissionStore.getState();
    expect(state.roles).toEqual([]);
    expect(state.permissions).toEqual([]);
  });
});

describe('hasPermission', () => {
  it('is true for a permission included in the granted set', () => {
    usePermissionStore
      .getState()
      .setPermissions({ roles: [], permissions: [PERMS.warehouse.read] });

    expect(hasPermission(PERMS.warehouse.read)).toBe(true);
  });

  it('is false for a non-SUPERADMIN role without the exact permission', () => {
    usePermissionStore
      .getState()
      .setPermissions({ roles: ['ADMIN'], permissions: [] });

    expect(hasPermission(PERMS.warehouse.read)).toBe(false);
  });

  it('is false for a permission not in the granted set', () => {
    usePermissionStore
      .getState()
      .setPermissions({ roles: [], permissions: [PERMS.warehouse.read] });

    expect(hasPermission(PERMS.warehouse.delete)).toBe(false);
  });

  it('does not treat a lowercase superadmin role as SUPERADMIN (exact-string bypass)', () => {
    usePermissionStore
      .getState()
      .setPermissions({ roles: ['superadmin'], permissions: [] });

    expect(hasPermission(PERMS.warehouse.read)).toBe(false);
  });

  it('keeps granting every permission when SUPERADMIN is combined with an unrelated permission list', () => {
    usePermissionStore.getState().setPermissions({
      roles: ['SUPERADMIN'],
      permissions: [PERMS.warehouse.read],
    });

    expect(hasPermission(PERMS.warehouse.delete)).toBe(true);
  });

  it('grants every permission to the SUPERADMIN role without listing them', () => {
    usePermissionStore
      .getState()
      .setPermissions({ roles: ['SUPERADMIN'], permissions: [] });

    for (const permission of ALL_PERMISSIONS) {
      expect(hasPermission(permission)).toBe(true);
    }
  });
});

describe('useHasPermission', () => {
  it('re-renders with the new answer when permissions change while mounted, unlike a plain hasPermission() read', () => {
    usePermissionStore
      .getState()
      .setPermissions({ roles: [], permissions: [PERMS.warehouse.read] });

    const { result } = renderHook(() =>
      useHasPermission(PERMS.warehouse.write),
    );
    expect(result.current).toBe(false);

    act(() => {
      usePermissionStore.getState().setPermissions({
        roles: [],
        permissions: [PERMS.warehouse.read, PERMS.warehouse.write],
      });
    });

    expect(result.current).toBe(true);
  });

  it('flips back to false immediately when write is revoked while the page stays open', () => {
    usePermissionStore.getState().setPermissions({
      roles: [],
      permissions: [PERMS.warehouse.read, PERMS.warehouse.write],
    });

    const { result } = renderHook(() =>
      useHasPermission(PERMS.warehouse.write),
    );
    expect(result.current).toBe(true);

    act(() => {
      usePermissionStore
        .getState()
        .setPermissions({ roles: [], permissions: [PERMS.warehouse.read] });
    });

    expect(result.current).toBe(false);
  });

  it('is true for every permission when the SUPERADMIN role is granted', () => {
    usePermissionStore
      .getState()
      .setPermissions({ roles: ['SUPERADMIN'], permissions: [] });

    for (const permission of ALL_PERMISSIONS) {
      const { result } = renderHook(() => useHasPermission(permission));
      expect(result.current).toBe(true);
    }
  });

  it('is false for a non-SUPERADMIN role without the exact permission', () => {
    usePermissionStore
      .getState()
      .setPermissions({ roles: ['ADMIN'], permissions: [] });

    const { result } = renderHook(() => useHasPermission(PERMS.warehouse.read));
    expect(result.current).toBe(false);
  });

  it('tolerates a session saved without roles or permissions', () => {
    usePermissionStore.setState({
      roles: undefined,
      permissions: undefined,
    } as never);

    expect(hasPermission(PERMS.warehouse.read)).toBe(false);

    usePermissionStore
      .getState()
      .setPermissions({ permissions: ['warehouse:read'] });

    expect(usePermissionStore.getState().roles).toEqual([]);
    expect(hasPermission(PERMS.warehouse.read)).toBe(true);
  });
});
