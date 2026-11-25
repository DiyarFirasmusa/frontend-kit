import { describe, expect, it } from 'vitest';
import { makeWarehouse } from '../warehouse-test-utils';
import {
  defaultWarehouseForm,
  isOptionalUuid,
  toWarehousePayload,
  toWarehouseValues,
  warehouseSchema,
  type WarehouseValues,
} from './validations';

const valid: WarehouseValues = {
  ...defaultWarehouseForm,
  name: 'Main',
  code: 'WH-01',
  address: 'Baghdad',
};

function firstMessage(values: unknown): string | undefined {
  return warehouseSchema.safeParse(values).error?.issues[0]?.message;
}

describe('warehouseSchema', () => {
  it('accepts the minimal valid form', () => {
    expect(warehouseSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a name and a code with i18n-key messages', () => {
    const result = warehouseSchema.safeParse(defaultWarehouseForm);
    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toContain('warehouses.form.errors.name');
    expect(messages).toContain('warehouses.form.errors.code');
  });

  it('rejects a name longer than 200 characters', () => {
    expect(firstMessage({ ...valid, name: 'a'.repeat(201) })).toBe(
      'warehouses.form.errors.nameMax',
    );
    expect(firstMessage({ ...valid, name: 'a'.repeat(200) })).toBeUndefined();
  });

  it('rejects a code longer than 30 characters', () => {
    expect(firstMessage({ ...valid, code: 'C'.repeat(31) })).toBe(
      'warehouses.form.errors.codeMax',
    );
    expect(firstMessage({ ...valid, code: 'C'.repeat(30) })).toBeUndefined();
  });

  it('requires an address', () => {
    expect(firstMessage({ ...valid, address: '   ' })).toBe(
      'warehouses.form.errors.address',
    );
  });

  it('rejects an address longer than 300 characters', () => {
    expect(firstMessage({ ...valid, address: 'a'.repeat(301) })).toBe(
      'warehouses.form.errors.addressMax',
    );
  });

  it('accepts empty UUID fields and rejects malformed ones', () => {
    expect(
      warehouseSchema.safeParse({ ...valid, managerUserId: '' }).success,
    ).toBe(true);
    for (const field of [
      'hrOrgUnitId',
      'managerEmployeeId',
      'managerUserId',
    ] as const) {
      expect(firstMessage({ ...valid, [field]: 'not-a-uuid' })).toBe(
        'warehouses.form.errors.uuid',
      );
    }
  });
});

describe('isOptionalUuid', () => {
  it('treats empty as valid and checks the UUID shape', () => {
    expect(isOptionalUuid('')).toBe(true);
    expect(isOptionalUuid('6f1d2c3a-0000-4000-8000-000000000001')).toBe(true);
    expect(isOptionalUuid('6f1d2c3a-0000-4000-8000-00000000001')).toBe(false);
  });
});

describe('toWarehousePayload', () => {
  it('trims values and omits empty optional fields', () => {
    expect(
      toWarehousePayload({
        ...valid,
        name: '  Main ',
        code: ' WH-01 ',
        address: '',
      }),
    ).toEqual({
      name: 'Main',
      code: 'WH-01',
      isTransit: false,
      isActive: true,
    });
  });

  it('keeps filled optional fields and the transit and active flags', () => {
    const payload = toWarehousePayload({
      ...valid,
      address: ' Erbil ',
      managerUserId: '6f1d2c3a-0000-4000-8000-000000000001',
      isTransit: true,
      isActive: false,
    });
    expect(payload).toEqual({
      name: 'Main',
      code: 'WH-01',
      address: 'Erbil',
      managerUserId: '6f1d2c3a-0000-4000-8000-000000000001',
      isTransit: true,
      isActive: false,
    });
    expect(payload).not.toHaveProperty('hrOrgUnitId');
    expect(payload).not.toHaveProperty('managerEmployeeId');
  });
});

describe('toWarehouseValues', () => {
  it('maps nulls to empty strings and keeps the flags', () => {
    expect(
      toWarehouseValues(
        makeWarehouse({
          address: null,
          managerUserId: null,
          name: null,
          isTransit: null,
          isActive: null,
        }),
      ),
    ).toEqual({
      name: '',
      code: 'BGD-01',
      address: '',
      hrOrgUnitId: '',
      managerEmployeeId: '',
      managerUserId: '',
      isTransit: false,
      isActive: true,
    });
  });

  it('copies the ids and flags of a full record', () => {
    expect(
      toWarehouseValues(
        makeWarehouse({
          hrOrgUnitId: 'org-1',
          isTransit: true,
          isActive: false,
        }),
      ),
    ).toMatchObject({
      hrOrgUnitId: 'org-1',
      isTransit: true,
      isActive: false,
    });
  });
});

describe('defaultWarehouseForm', () => {
  it('starts empty with regular, active warehouse defaults', () => {
    expect(defaultWarehouseForm).toEqual({
      name: '',
      code: '',
      address: '',
      hrOrgUnitId: '',
      managerEmployeeId: '',
      managerUserId: '',
      isTransit: false,
      isActive: true,
    });
  });

  it('is rejected by the schema until name and code are filled', () => {
    expect(warehouseSchema.safeParse(defaultWarehouseForm).success).toBe(false);
  });
});
