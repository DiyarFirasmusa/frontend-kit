import { describe, expect, it } from 'vitest';
import type { CanCheck } from '@/components/auth/can';
import { PERMS, type Permission } from '@/constants/permissions';
import type { CategoryAttributeResponse } from '@/types/api/catalog';
import { canWriteAssignment, getCategoryAccess } from './category-actions';

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

const canWith =
  (...granted: Permission[]): CanCheck =>
  (permission) =>
    granted.includes(permission);

describe('getCategoryAccess', () => {
  it('answers nothing without permissions', () => {
    expect(getCategoryAccess(canWith())).toEqual({
      view: false,
      create: false,
      update: false,
      delete: false,
    });
  });

  it('keeps create, update and delete apart', () => {
    expect(getCategoryAccess(canWith(PERMS.itemCategory.create))).toMatchObject(
      { create: true, update: false, delete: false },
    );
    expect(getCategoryAccess(canWith(PERMS.itemCategory.update))).toMatchObject(
      { create: false, update: true, delete: false },
    );
    expect(getCategoryAccess(canWith(PERMS.itemCategory.delete))).toMatchObject(
      { create: false, update: false, delete: true },
    );
    expect(getCategoryAccess(canWith(PERMS.itemCategory.view)).view).toBe(true);
  });
});

describe('canWriteAssignment', () => {
  it('allows an own assignment with item_category:update', () => {
    expect(
      canWriteAssignment(canWith(PERMS.itemCategory.update), assignment()),
    ).toBe(true);
  });

  it('denies an inherited assignment even with update permission', () => {
    expect(
      canWriteAssignment(
        canWith(PERMS.itemCategory.update),
        assignment({ inherited: true }),
      ),
    ).toBe(false);
  });

  it('denies an own assignment with create alone', () => {
    expect(
      canWriteAssignment(canWith(PERMS.itemCategory.create), assignment()),
    ).toBe(false);
  });
});
