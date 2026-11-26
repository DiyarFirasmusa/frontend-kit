import { describe, expect, it, vi } from 'vitest';
import type { CanCheck } from '@/components/auth/can';
import { PERMS, type Permission } from '@/constants/permissions';
import { makeWarehouse } from '../warehouse-test-utils';
import { getWarehouseRowActions } from './warehouse-actions';

const t = (key: string) => key;

const canWith =
  (...granted: Permission[]): CanCheck =>
  (permission) =>
    granted.includes(permission);

function actionIds(...granted: Permission[]): string[] {
  return getWarehouseRowActions({
    t,
    can: canWith(...granted),
    row: makeWarehouse(),
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }).map((action) => action.id);
}

describe('warehouse actions', () => {
  it('read-only users cannot edit or delete', () => {
    expect(actionIds(PERMS.warehouse.view)).toEqual(['view']);
  });

  it('update gives edit but not delete', () => {
    expect(actionIds(PERMS.warehouse.view, PERMS.warehouse.update)).toEqual([
      'view',
      'edit',
    ]);
  });

  it('create alone gives no edit (it is the page-level add button)', () => {
    expect(actionIds(PERMS.warehouse.create)).toEqual(['view']);
  });

  it('deleters get delete without edit', () => {
    expect(actionIds(PERMS.warehouse.delete)).toEqual(['view', 'delete']);
  });

  it('shows edit and delete for full warehouse permissions', () => {
    expect(
      actionIds(
        PERMS.warehouse.view,
        PERMS.warehouse.create,
        PERMS.warehouse.update,
        PERMS.warehouse.delete,
      ),
    ).toEqual(['view', 'edit', 'delete']);
  });

  it('marks delete as destructive and calls the matching handler', () => {
    const onDelete = vi.fn();
    const row = makeWarehouse();
    const actions = getWarehouseRowActions({
      t,
      can: canWith(PERMS.warehouse.update, PERMS.warehouse.delete),
      row,
      onView: vi.fn(),
      onEdit: vi.fn(),
      onDelete,
    });
    const remove = actions.find((action) => action.id === 'delete');
    expect(remove?.variant).toBe('destructive');
    expect(remove?.separatorBefore).toBe(true);
    remove?.onSelect();
    expect(onDelete).toHaveBeenCalledWith(row);
  });
});
