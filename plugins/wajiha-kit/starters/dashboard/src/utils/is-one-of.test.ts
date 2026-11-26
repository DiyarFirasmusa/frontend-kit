import { describe, expect, it } from 'vitest';
import { isOneOf } from './is-one-of';

const ROLES = ['ADMIN', 'VIEWER'] as const;

describe('isOneOf', () => {
  it('accepts a listed value', () => {
    expect(isOneOf(ROLES, 'ADMIN')).toBe(true);
  });

  it('rejects an unlisted value, a different case and a non-string', () => {
    expect(isOneOf(ROLES, 'OWNER')).toBe(false);
    expect(isOneOf(ROLES, 'admin')).toBe(false);
    expect(isOneOf(ROLES, 1)).toBe(false);
    expect(isOneOf(ROLES, null)).toBe(false);
  });
});
