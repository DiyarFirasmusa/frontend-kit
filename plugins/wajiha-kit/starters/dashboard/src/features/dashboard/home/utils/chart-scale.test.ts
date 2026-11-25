import { describe, expect, it } from 'vitest';
import { niceTicks, pickTickIndexes } from './chart-scale';

describe('niceTicks', () => {
  it('covers the maximum with four round steps from zero', () => {
    expect(niceTicks(1040)).toEqual([0, 400, 800, 1200]);
    expect(niceTicks(65)).toEqual([0, 25, 50, 75]);
    expect(niceTicks(9)).toEqual([0, 4, 8, 12]);
  });

  it('falls back to unit steps for an empty or invalid maximum', () => {
    expect(niceTicks(0)).toEqual([0, 1, 2, 3]);
    expect(niceTicks(Number.NaN)).toEqual([0, 1, 2, 3]);
  });
});

describe('pickTickIndexes', () => {
  it('anchors on the last day and steps back evenly (1, 6, 12, 18, 24, 30)', () => {
    expect(pickTickIndexes(30)).toEqual([0, 5, 11, 17, 23, 29]);
  });

  it('keeps every index for short series and none for an empty one', () => {
    expect(pickTickIndexes(4)).toEqual([0, 1, 2, 3]);
    expect(pickTickIndexes(0)).toEqual([]);
  });
});
