import { describe, expect, it } from 'vitest';
import { formatCount, formatShortDate } from './format';

const EASTERN_DIGITS = /[٠-٩]/u;

describe('admin formatting', () => {
  it('writes counts with Western digits in Arabic too', () => {
    expect(formatCount(1234, 'en')).toBe('1,234');
    expect(formatCount(1234, 'ar')).not.toMatch(EASTERN_DIGITS);
    expect(formatCount(1234, 'ar')).toContain('234');
  });

  it('formats a date in the page language with Western digits', () => {
    expect(formatShortDate('2026-01-15T09:00:00.000Z', 'en')).toContain('2026');
    expect(formatShortDate('2026-01-15T09:00:00.000Z', 'ar')).not.toMatch(EASTERN_DIGITS);
  });
});
