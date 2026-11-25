import { describe, expect, it } from 'vitest';
import { formatted, matchesFormat } from './formats';

describe('formats', () => {
  it.each([
    ['code', 'ENG', true],
    ['code', 'eng', true],
    ['code', 'ENG1', false],
    ['code', '22', false],
    ['code', 'EN G', false],
    ['code', 'مدير', false],
    ['digits', '5', true],
    ['digits', '12', true],
    ['digits', 'hh', false],
    ['digits', '1.5', false],
    ['personName', 'Ali Hussein', true],
    ['personName', 'علي حسين', true],
    ['personName', "O'Brien-Smith", true],
    ['personName', 'Ali2', false],
    ['personName', '   ', false],
    ['labelText', 'Senior Engineer', true],
    ['labelText', 'Level 2 (Support)', true],
    ['labelText', '12345', false],
    ['labelText', '@@@', false],
    ['phone', '+964 770 123 4567', true],
    ['phone', '07701234567', true],
    ['phone', '123', false],
    ['phone', '0770-abc-4567', false],
    ['alphanumeric', 'A123456', true],
    ['alphanumeric', 'A-123', false],
    ['identifier', 'EPP-001', true],
    ['identifier', '-EPP', false],
    ['identifier', 'EPP 001', false],
    ['username', 'ali.hussein@corp', true],
    ['username', 'ali hussein', false],
    ['currency', 'IQD', true],
    ['currency', 'IQ', false],
    ['currency', 'U5D', false],
    ['bloodType', 'O+', true],
    ['bloodType', 'AB-', true],
    ['bloodType', 'C+', false],
    ['bloodType', 'A', false],
  ] as const)('%s accepts %j: %s', (kind, value, expected) => {
    expect(matchesFormat(kind, value)).toBe(expected);
  });
});

describe('formatted()', () => {
  it('allows empty (optional) values but rejects wrong or over-long text', () => {
    const schema = formatted('code', 30);
    expect(schema.safeParse('').success).toBe(true);
    expect(schema.safeParse('  HR  ').data).toBe('HR');
    expect(schema.safeParse('HR1').success).toBe(false);
    expect(schema.safeParse('A'.repeat(31)).success).toBe(false);
  });

  it('can be made required', () => {
    const schema = formatted('code', 30).min(1, 'required');
    expect(schema.safeParse('').success).toBe(false);
  });
});
