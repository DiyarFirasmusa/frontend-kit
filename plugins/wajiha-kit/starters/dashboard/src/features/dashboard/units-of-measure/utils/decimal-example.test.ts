import { describe, expect, it } from 'vitest';
import { formatDecimalExample } from './decimal-example';

describe('formatDecimalExample', () => {
  it('renders an em dash when decimal places are missing', () => {
    expect(formatDecimalExample(null)).toBe('—');
    const absent = new Map<string, number>().get('decimalPlaces');
    expect(formatDecimalExample(absent)).toBe('—');
  });

  it('renders the sample value at the given precision', () => {
    expect(formatDecimalExample(0)).toBe('12');
    expect(formatDecimalExample(2)).toBe('12.35');
    expect(formatDecimalExample(3)).toBe('12.346');
  });

  it('renders an em dash for values outside 0 to 6', () => {
    expect(formatDecimalExample(7)).toBe('—');
    expect(formatDecimalExample(-1)).toBe('—');
  });
});
