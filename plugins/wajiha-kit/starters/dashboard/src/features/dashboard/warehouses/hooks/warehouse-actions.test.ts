import { describe, expect, it, vi } from 'vitest';
import { PERMS, type Permission } from '@/constants/permissions';
import i18n from '@/lib/i18n/i18n';
import { makeWarehouse } from '../warehouse-test-utils';
import { getWarehouseRowActions } from './warehouse-actions';

const t = i18n.t.bind(i18n);

function actionsFor(granted: Permission[], locationCount = 0) {
  const onView = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const actions = getWarehouseRowActions(makeWarehouse({ locationCount }), {
    t,
    can: (permission) => granted.includes(permission),
    onView,
    onEdit,
    onDelete,
  });
  return { actions, onView, onEdit, onDelete };
}

describe('getWarehouseRowActions', () => {
  it('offers only view with view permission', () => {
    const { actions, onView } = actionsFor([PERMS.warehouse.view]);
    expect(actions.map((action) => action.id)).toEqual(['view']);
    actions[0]?.onSelect();
    expect(onView).toHaveBeenCalledOnce();
  });

  it('adds edit with update permission', () => {
    const { actions, onEdit } = actionsFor([PERMS.warehouse.update]);
    expect(actions.map((action) => action.id)).toEqual(['view', 'edit']);
    actions[1]?.onSelect();
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('adds delete with delete permission and no reason when it is allowed', () => {
    const { actions } = actionsFor([PERMS.warehouse.delete]);
    expect(actions.map((action) => action.id)).toEqual(['view', 'delete']);
    expect(actions[1]?.disabledReason).toBeUndefined();
  });

  it('keeps delete for a warehouse with locations, with the reason', () => {
    const { actions } = actionsFor([PERMS.warehouse.delete], 4);
    expect(actions[1]?.disabledReason).toBeTruthy();
  });
});
