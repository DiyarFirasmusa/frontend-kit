import { describe, expect, it } from 'vitest';
import { activeBadge } from './status-tones';

describe('activeBadge', () => {
  it('reads true as an active, success badge', () => {
    expect(activeBadge(true)).toEqual({
      tone: 'success',
      labelKey: 'common.active',
    });
  });

  it('reads false as an inactive, neutral badge', () => {
    expect(activeBadge(false)).toEqual({
      tone: 'neutral',
      labelKey: 'common.inactive',
    });
  });

  it('reads null as unknown', () => {
    expect(activeBadge(null)).toEqual({
      tone: 'neutral',
      labelKey: 'common.unknown',
    });
  });
});
