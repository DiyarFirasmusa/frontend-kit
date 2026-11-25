import { describe, expect, it } from 'vitest';
import { getInitials } from './initials';

describe('getInitials', () => {
  it('uses the first and last name when both are known', () => {
    expect(
      getInitials({ firstName: 'Ali', lastName: 'Karkhi', displayName: 'X Y' }),
    ).toBe('AK');
  });

  it('uses the first two words of the display name otherwise', () => {
    expect(getInitials({ displayName: 'Ali Hassan Karkhi' })).toBe('AH');
    expect(getInitials({ displayName: 'علي الكرخي' })).toBe('عا');
  });

  it('uses the first two letters of a single word', () => {
    expect(getInitials({ displayName: 'admin' })).toBe('AD');
  });

  it('falls back to the em dash without a name', () => {
    expect(getInitials(null)).toBe('—');
    expect(getInitials({ displayName: '  ' })).toBe('—');
  });
});
