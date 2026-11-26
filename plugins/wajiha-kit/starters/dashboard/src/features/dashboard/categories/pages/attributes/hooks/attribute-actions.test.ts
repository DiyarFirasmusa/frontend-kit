import { beforeAll, describe, expect, it, vi } from 'vitest';
import { PERMS, type Permission } from '@/constants/permissions';
import i18n, { loadFeatureLocale } from '@/lib/i18n/i18n';
import type { AttributeRow } from '../../../types/types';
import { getAttributeRowActions } from './attribute-actions';

const t = i18n.t.bind(i18n);

function makeAttribute(overrides: Partial<AttributeRow> = {}): AttributeRow {
  return {
    id: 'attr-1',
    code: 'COLOR',
    name: 'Color',
    dataType: 'OPTION',
    unitLabel: null,
    isActive: true,
    options: [],
    ...overrides,
  };
}

function actionsFor(granted: Permission[], row = makeAttribute()) {
  const onEdit = vi.fn();
  const onEditOptions = vi.fn();
  const onDelete = vi.fn();
  const actions = getAttributeRowActions(row, {
    t,
    can: (permission) => granted.includes(permission),
    onEdit,
    onEditOptions,
    onDelete,
  });
  return { actions, onEdit, onEditOptions, onDelete };
}

describe('getAttributeRowActions', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('renders nothing with view only', () => {
    expect(actionsFor([PERMS.attributeDefinition.view]).actions).toEqual([]);
  });

  it('offers edit and options with update, options only for OPTION', () => {
    const { actions, onEditOptions } = actionsFor([
      PERMS.attributeDefinition.update,
    ]);
    expect(actions.map((action) => action.id)).toEqual(['edit', 'options']);
    actions[1]?.onSelect();
    expect(onEditOptions).toHaveBeenCalledOnce();

    const text = actionsFor(
      [PERMS.attributeDefinition.update],
      makeAttribute({ dataType: 'TEXT' }),
    );
    expect(text.actions.map((action) => action.id)).toEqual(['edit']);
  });

  it('offers delete with delete only', () => {
    const { actions, onDelete } = actionsFor([
      PERMS.attributeDefinition.delete,
    ]);
    expect(actions.map((action) => action.id)).toEqual(['delete']);
    actions[0]?.onSelect();
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('names the row in every label', () => {
    const { actions } = actionsFor([
      PERMS.attributeDefinition.update,
      PERMS.attributeDefinition.delete,
    ]);
    for (const action of actions) {
      expect(action.label).toContain('Color');
    }
  });
});
