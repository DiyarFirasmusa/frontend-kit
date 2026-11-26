import { describe, expect, it, vi } from 'vitest';
import { PERMS, type Permission } from '@/constants/permissions';
import i18n from '@/lib/i18n/i18n';
import { makeUnitOfMeasure } from '../uom-test-utils';
import { getUnitOfMeasureRowActions } from './uom-actions';

const t = i18n.t.bind(i18n);

function actionsFor(granted: Permission[], inUse = false) {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const actions = getUnitOfMeasureRowActions(makeUnitOfMeasure({ inUse }), {
    t,
    can: (permission) => granted.includes(permission),
    onEdit,
    onDelete,
  });
  return { actions, onEdit, onDelete };
}

describe('getUnitOfMeasureRowActions', () => {
  it('renders nothing with view only', () => {
    expect(actionsFor([PERMS.unitOfMeasure.view]).actions).toEqual([]);
  });

  it('offers edit with update only', () => {
    const { actions, onEdit } = actionsFor([PERMS.unitOfMeasure.update]);
    expect(actions.map((action) => action.id)).toEqual(['edit']);
    actions[0]?.onSelect();
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('offers delete with delete only', () => {
    const { actions } = actionsFor([PERMS.unitOfMeasure.delete]);
    expect(actions.map((action) => action.id)).toEqual(['delete']);
    expect(actions[0]?.disabledReason).toBeUndefined();
  });

  it('keeps delete for a unit used by items, with the reason', () => {
    const { actions } = actionsFor([PERMS.unitOfMeasure.delete], true);
    expect(actions[0]?.disabledReason).toBeTruthy();
  });
});
