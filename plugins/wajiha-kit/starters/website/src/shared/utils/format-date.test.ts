import { describe, expect, it } from 'vitest';
import { formatDate } from './format-date';

describe('formatDate', () => {
  it('prints the same date in any machine time zone (UTC, explicit locale)', () => {
    expect(formatDate('en', '2026-09-14')).toBe('14 September 2026');
  });

  it('uses Latin digits in Arabic so numbers match the rest of the page', () => {
    const text = formatDate('ar', '2026-09-14');
    expect(text).toMatch(/14/);
    expect(text).toMatch(/2026/);
  });
});
