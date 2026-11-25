import { beforeEach, describe, expect, it } from 'vitest';
import { PERMS } from '@/constants/permissions';
import { signIn } from '@/test/fixtures/auth';
import type { CategoryAttributeResponse } from '@/types/api/catalog';
import {
  canDeleteCategory,
  canReadCategory,
  canWriteAssignment,
  canWriteCategory,
} from './category-actions';

function assignment(
  overrides: Partial<CategoryAttributeResponse> = {},
): CategoryAttributeResponse {
  return {
    id: 'asg-1',
    sourceCategoryId: 'cat-hand',
    sourceCategoryName: null,
    unitLabel: null,
    options: null,
    inherited: false,
    attributeDefinitionId: 'attr-color',
    attributeCode: 'COLOR',
    attributeName: 'اللون',
    dataType: 'OPTION',
    isRequired: false,
    isVariantAxis: true,
    sortOrder: 1,
    ...overrides,
  };
}

describe('category actions', () => {
  beforeEach(() => {
    signIn({ roles: [], permissions: [] });
  });

  it('reads the category permission from the store', () => {
    expect(canReadCategory()).toBe(false);
    signIn({ roles: [], permissions: [PERMS.itemCategory.read] });
    expect(canReadCategory()).toBe(true);
  });

  it('allows writing only with item_category:write', () => {
    signIn({ roles: [], permissions: [PERMS.itemCategory.read] });
    expect(canWriteCategory()).toBe(false);
    signIn({ roles: [], permissions: [PERMS.itemCategory.write] });
    expect(canWriteCategory()).toBe(true);
  });

  it('allows deleting only with item_category:delete', () => {
    signIn({ roles: [], permissions: [PERMS.itemCategory.write] });
    expect(canDeleteCategory()).toBe(false);
    signIn({ roles: [], permissions: [PERMS.itemCategory.delete] });
    expect(canDeleteCategory()).toBe(true);
  });

  it('allows writing an own assignment with write permission', () => {
    signIn({ roles: [], permissions: [PERMS.itemCategory.write] });
    expect(canWriteAssignment(assignment())).toBe(true);
  });

  it('denies writing an inherited assignment even with write permission', () => {
    signIn({ roles: [], permissions: [PERMS.itemCategory.write] });
    expect(canWriteAssignment(assignment({ inherited: true }))).toBe(false);
  });

  it('denies writing an own assignment without write permission', () => {
    signIn({ roles: [], permissions: [PERMS.itemCategory.read] });
    expect(canWriteAssignment(assignment())).toBe(false);
  });
});
