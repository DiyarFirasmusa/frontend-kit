import { describe, expect, it } from 'vitest';
import { unitOfMeasureActiveBadge } from './uom-status';

describe('unitOfMeasureActiveBadge', () => {
  it('maps an active unit to the success tone', () => {
    expect(unitOfMeasureActiveBadge(true)).toEqual({
      tone: 'success',
      labelKey: 'unitsOfMeasure.status.active',
    });
  });

  it('maps an inactive unit to the neutral tone', () => {
    expect(unitOfMeasureActiveBadge(false)).toEqual({
      tone: 'neutral',
      labelKey: 'unitsOfMeasure.status.inactive',
    });
  });

  it('treats an unknown status as inactive', () => {
    expect(unitOfMeasureActiveBadge(null)).toEqual({
      tone: 'neutral',
      labelKey: 'unitsOfMeasure.status.inactive',
    });
  });
});
