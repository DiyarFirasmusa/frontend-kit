import { describe, expect, it, vi } from 'vitest';
import { PERMS } from '@/constants/permissions';
import { signIn } from '@/test/fixtures/auth';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import {
  canEditAttributeOptions,
  getAttributeRowActions,
} from './attribute-actions';

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
  it('is false for non-OPTION types even with write permission', () => {
    signIn({ roles: [], permissions: [PERMS.attributeDefinition.write] });
    expect(canEditAttributeOptions(makeAttribute({ dataType: 'TEXT' }))).toBe(
      false,
    );
    expect(canEditAttributeOptions(makeAttribute({ dataType: 'NUMBER' }))).toBe(
      false,
    );
  });

  it('is false without write permission for OPTION types', () => {
    signIn({ roles: [], permissions: [PERMS.attributeDefinition.read] });
    expect(canEditAttributeOptions(makeAttribute())).toBe(false);
  });

  it('is true for OPTION types with write permission', () => {
    signIn({ roles: [], permissions: [PERMS.attributeDefinition.write] });
    expect(canEditAttributeOptions(makeAttribute())).toBe(true);
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
