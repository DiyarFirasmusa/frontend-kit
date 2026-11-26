import { describe, expect, it, vi } from 'vitest';
import type { CanCheck } from '@/components/auth/can';
import { PERMS, type Permission } from '@/constants/permissions';
import { makeUnitOfMeasure } from '../uom-test-utils';
import { getUnitOfMeasureRowActions } from './uom-actions';

const t = (key: string) => key;

const canWith =
  (...granted: Permission[]): CanCheck =>
  (permission) =>
    granted.includes(permission);

function actionIds(...granted: Permission[]): string[] {
  return getUnitOfMeasureRowActions({
    t,
    can: canWith(...granted),
    row: makeUnitOfMeasure(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }).map((action) => action.id);
}

describe('unit of measure actions', () => {
  it('read-only users get no row actions', () => {
    expect(actionIds(PERMS.unitOfMeasure.view)).toEqual([]);
  });

  it('update gives edit but not delete', () => {
    expect(
      actionIds(PERMS.unitOfMeasure.view, PERMS.unitOfMeasure.update),
    ).toEqual(['edit']);
  });

  it('create alone gives no row action (it is the page-level add button)', () => {
    expect(actionIds(PERMS.unitOfMeasure.create)).toEqual([]);
  });

  it('deleters get delete but not edit', () => {
    expect(actionIds(PERMS.unitOfMeasure.delete)).toEqual(['delete']);
  });

  it('never includes a view action', () => {
    const ids = actionIds(
      PERMS.unitOfMeasure.view,
      PERMS.unitOfMeasure.create,
      PERMS.unitOfMeasure.update,
      PERMS.unitOfMeasure.delete,
    );
    expect(ids).toEqual(['edit', 'delete']);
    expect(ids).not.toContain('view');
  });

  it('marks delete as destructive and calls the matching handler', () => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    const row = makeUnitOfMeasure();
    const actions = getUnitOfMeasureRowActions({
      t,
      can: canWith(PERMS.unitOfMeasure.update, PERMS.unitOfMeasure.delete),
      row,
      onEdit,
      onDelete,
    });
    const remove = actions.find((action) => action.id === 'delete');
    expect(remove?.variant).toBe('destructive');
    expect(remove?.separatorBefore).toBe(true);
    expect(remove?.label).toBe('unitsOfMeasure.actions.delete');
    remove?.onSelect();
    expect(onDelete).toHaveBeenCalledWith(row);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('calls onEdit with the row when edit is selected', () => {
    const onEdit = vi.fn();
    const row = makeUnitOfMeasure();
    const actions = getUnitOfMeasureRowActions({
      t,
      can: canWith(PERMS.unitOfMeasure.update),
      row,
      onEdit,
      onDelete: vi.fn(),
    });
    actions.find((action) => action.id === 'edit')?.onSelect();
    expect(onEdit).toHaveBeenCalledWith(row);
  });
});
