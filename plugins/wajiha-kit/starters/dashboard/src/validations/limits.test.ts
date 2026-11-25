import { describe, expect, it } from 'vitest';
import { limited } from './limits';

describe('limited', () => {
  it('trims and accepts text up to the limit', () => {
    expect(limited(10).parse('  abcdefghij  ')).toBe('abcdefghij');
  });

  it('rejects longer text with a translatable key', () => {
    const result = limited(10).safeParse('abcdefghijk');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'common.validation.maxLength10',
      );
    }
  });
});
