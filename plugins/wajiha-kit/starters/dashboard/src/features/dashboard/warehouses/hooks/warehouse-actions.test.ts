import { describe, expect, it, vi } from 'vitest';
import { PERMS } from '@/constants/permissions';
import { signIn } from '@/test/fixtures/auth';
import { makeWarehouse } from '../warehouse-test-utils';
import {
  canDeleteWarehouse,
  canEditWarehouse,
  getWarehouseRowActions,
} from './warehouse-actions';

const t = (key: string) => key;

function actionIds(): string[] {
  return getWarehouseRowActions({
    t,
    row: makeWarehouse(),
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }).map((action) => action.id);
}

describe('warehouse actions', () => {
  it('read-only users cannot edit or delete', () => {
    signIn({ roles: [], permissions: [PERMS.warehouse.read] });
    expect(canEditWarehouse()).toBe(false);
    expect(canDeleteWarehouse()).toBe(false);
    expect(actionIds()).toEqual(['view']);
  });

  it('writers get edit but not delete', () => {
    signIn({
      roles: [],
      permissions: [PERMS.warehouse.read, PERMS.warehouse.write],
    });
    expect(canEditWarehouse()).toBe(true);
    expect(canDeleteWarehouse()).toBe(false);
    expect(actionIds()).toEqual(['view', 'edit']);
  });

  it('deleters get delete without edit', () => {
    signIn({ roles: [], permissions: [PERMS.warehouse.delete] });
    expect(canEditWarehouse()).toBe(false);
    expect(canDeleteWarehouse()).toBe(true);
    expect(actionIds()).toEqual(['view', 'delete']);
  });

  it('shows edit and delete for full warehouse permissions', () => {
    signIn({
      roles: [],
      permissions: [
        PERMS.warehouse.read,
        PERMS.warehouse.write,
        PERMS.warehouse.delete,
      ],
    });
    expect(actionIds()).toEqual(['view', 'edit', 'delete']);
  });

  it('marks delete as destructive and calls the matching handler', () => {
    signIn({
      roles: [],
      permissions: [PERMS.warehouse.write, PERMS.warehouse.delete],
    });
    const onDelete = vi.fn();
    const row = makeWarehouse();
    const actions = getWarehouseRowActions({
      t,
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
