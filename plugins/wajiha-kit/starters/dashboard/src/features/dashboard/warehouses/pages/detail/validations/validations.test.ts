import { describe, expect, it } from 'vitest';
import {
  addMemberSchema,
  defaultAddMemberForm,
  toAddMemberPayload,
} from './validations';

const VALID_UUID = '6f1d2c3a-0000-4000-8000-000000000002';

describe('addMemberSchema', () => {
  it('accepts a UUID user id with a role', () => {
    expect(
      addMemberSchema.safeParse({ userId: VALID_UUID, role: 'STOREKEEPER' })
        .success,
    ).toBe(true);
  });

  it('accepts a UUID surrounded by whitespace', () => {
    expect(
      addMemberSchema.safeParse({
        userId: `  ${VALID_UUID}  `,
        role: 'STOCK_CONTROLLER',
      }).success,
    ).toBe(true);
  });

  it('rejects an empty value with the UUID message key', () => {
    const result = addMemberSchema.safeParse({
      userId: '',
      role: 'STOREKEEPER',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      'warehouses.members.errors.userId',
    );
  });

  it('rejects a value that is not a UUID', () => {
    const result = addMemberSchema.safeParse({
      userId: 'user-42',
      role: 'STOREKEEPER',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      'warehouses.members.errors.userId',
    );
  });

  it('rejects a role the backend does not define', () => {
    const result = addMemberSchema.safeParse({
      userId: VALID_UUID,
      role: 'AUDITOR',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      'warehouses.members.errors.role',
    );
  });
});

describe('defaultAddMemberForm', () => {
  it('starts with an empty user id and the storekeeper role', () => {
    expect(defaultAddMemberForm).toEqual({
      userId: '',
      role: 'STOREKEEPER',
    });
  });
});

describe('toAddMemberPayload', () => {
  it('returns the trimmed user id and role as the request body', () => {
    expect(
      toAddMemberPayload({
        userId: `  ${VALID_UUID} `,
        role: 'WAREHOUSE_MANAGER',
      }),
    ).toEqual({ userId: VALID_UUID, role: 'WAREHOUSE_MANAGER' });
  });
});
