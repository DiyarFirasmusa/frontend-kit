import { describe, expect, it } from 'vitest';
import { DECIMAL_PLACES_OPTIONS } from './list-filters';

describe('DECIMAL_PLACES_OPTIONS', () => {
  it('offers the seven precision options from 0 to 6', () => {
    expect(DECIMAL_PLACES_OPTIONS).toEqual(['0', '1', '2', '3', '4', '5', '6']);
  });
});
