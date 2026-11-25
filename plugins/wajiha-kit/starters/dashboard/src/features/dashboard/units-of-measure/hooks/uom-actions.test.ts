import { describe, expect, it, vi } from 'vitest';
import { PERMS } from '@/constants/permissions';
import { signIn } from '@/test/fixtures/auth';
import { makeUnitOfMeasure } from '../uom-test-utils';
import {
  canDeleteUnitOfMeasure,
  canEditUnitOfMeasure,
  getUnitOfMeasureRowActions,
} from './uom-actions';

const t = (key: string) => key;

function actionIds(): string[] {
  return getUnitOfMeasureRowActions({
    t,
    row: makeUnitOfMeasure(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }).map((action) => action.id);
}

describe('unit of measure actions', () => {
  it('read-only users get no row actions', () => {
    signIn({ roles: [], permissions: [PERMS.unitOfMeasure.read] });
    expect(canEditUnitOfMeasure()).toBe(false);
    expect(canDeleteUnitOfMeasure()).toBe(false);
    expect(actionIds()).toEqual([]);
  });

  it('writers get edit but not delete', () => {
    signIn({
      roles: [],
      permissions: [PERMS.unitOfMeasure.read, PERMS.unitOfMeasure.write],
    });
    expect(canEditUnitOfMeasure()).toBe(true);
    expect(canDeleteUnitOfMeasure()).toBe(false);
    expect(actionIds()).toEqual(['edit']);
  });

  it('deleters get delete but not edit', () => {
    signIn({ roles: [], permissions: [PERMS.unitOfMeasure.delete] });
    expect(canEditUnitOfMeasure()).toBe(false);
    expect(canDeleteUnitOfMeasure()).toBe(true);
    expect(actionIds()).toEqual(['delete']);
  });

  it('never includes a view action', () => {
    signIn({
      roles: [],
      permissions: [
        PERMS.unitOfMeasure.read,
        PERMS.unitOfMeasure.write,
        PERMS.unitOfMeasure.delete,
      ],
    });
    expect(actionIds()).toEqual(['edit', 'delete']);
    expect(actionIds()).not.toContain('view');
  });

  it('marks delete as destructive and calls the matching handler', () => {
    signIn({
      roles: [],
      permissions: [PERMS.unitOfMeasure.write, PERMS.unitOfMeasure.delete],
    });
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    const row = makeUnitOfMeasure();
    const actions = getUnitOfMeasureRowActions({ t, row, onEdit, onDelete });
    const remove = actions.find((action) => action.id === 'delete');
    expect(remove?.variant).toBe('destructive');
    expect(remove?.separatorBefore).toBe(true);
    expect(remove?.label).toBe('unitsOfMeasure.actions.delete');
    remove?.onSelect();
    expect(onDelete).toHaveBeenCalledWith(row);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('calls onEdit with the row when edit is selected', () => {
    signIn({ roles: [], permissions: [PERMS.unitOfMeasure.write] });
    const onEdit = vi.fn();
    const row = makeUnitOfMeasure();
    const actions = getUnitOfMeasureRowActions({
      t,
      row,
      onEdit,
      onDelete: vi.fn(),
    });
    actions.find((action) => action.id === 'edit')?.onSelect();
    expect(onEdit).toHaveBeenCalledWith(row);
  });
});
