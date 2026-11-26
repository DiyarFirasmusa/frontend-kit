import { describe, expect, it, vi } from 'vitest';
import type { CanCheck } from '@/components/auth/can';
import { PERMS, type Permission } from '@/constants/permissions';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import {
  canEditAttributeOptions,
  getAttributeAccess,
  getAttributeRowActions,
} from './attribute-actions';

const canWith =
  (...granted: Permission[]): CanCheck =>
  (permission) =>
    granted.includes(permission);

const t = (key: string) => key;

function makeAttribute(
  overrides: Partial<AttributeDefinitionResponse> = {},
): AttributeDefinitionResponse {
  return {
    id: 'attr-color',
    code: 'COLOR',
    name: 'اللون',
    dataType: 'OPTION',
    unitLabel: null,
    isActive: true,
    options: [],
    ...overrides,
  };
}

function actionIds(
  row: AttributeDefinitionResponse,
  { canWrite, canDelete }: { canWrite: boolean; canDelete: boolean },
): string[] {
  return getAttributeRowActions({
    t,
    row,
    canWrite,
    canDelete,
    onEdit: vi.fn(),
    onEditOptions: vi.fn(),
    onDelete: vi.fn(),
  }).map((action) => action.id);
}

describe('canEditAttributeOptions', () => {
  const canUpdate = canWith(PERMS.attributeDefinition.update);

  it('is false for non-OPTION types even with update permission', () => {
    expect(
      canEditAttributeOptions(canUpdate, makeAttribute({ dataType: 'TEXT' })),
    ).toBe(false);
    expect(
      canEditAttributeOptions(canUpdate, makeAttribute({ dataType: 'NUMBER' })),
    ).toBe(false);
  });

  it('is false without update permission for OPTION types', () => {
    expect(
      canEditAttributeOptions(
        canWith(
          PERMS.attributeDefinition.view,
          PERMS.attributeDefinition.create,
        ),
        makeAttribute(),
      ),
    ).toBe(false);
  });

  it('is true for OPTION types with update permission', () => {
    expect(canEditAttributeOptions(canUpdate, makeAttribute())).toBe(true);
  });
});

describe('getAttributeAccess', () => {
  it('maps each permission to its own flag', () => {
    expect(
      getAttributeAccess(
        canWith(
          PERMS.attributeDefinition.view,
          PERMS.attributeDefinition.delete,
        ),
      ),
    ).toEqual({ view: true, create: false, update: false, delete: true });
  });
});

describe('getAttributeRowActions', () => {
  it('omits the options action for non-OPTION rows', () => {
    expect(
      actionIds(makeAttribute({ dataType: 'TEXT' }), {
        canWrite: true,
        canDelete: false,
      }),
    ).toEqual(['edit']);
  });

  it('includes the options action for OPTION rows when writable', () => {
    expect(
      actionIds(makeAttribute(), { canWrite: true, canDelete: false }),
    ).toEqual(['edit', 'options']);
  });

  it('omits delete without canDelete', () => {
    expect(
      actionIds(makeAttribute(), { canWrite: true, canDelete: false }),
    ).not.toContain('delete');
  });

  it('includes delete when canDelete is granted', () => {
    expect(
      actionIds(makeAttribute(), { canWrite: false, canDelete: true }),
    ).toEqual(['delete']);
  });
});
