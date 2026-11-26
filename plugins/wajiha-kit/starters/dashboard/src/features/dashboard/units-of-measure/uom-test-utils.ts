import type { UnitOfMeasureRow } from './types/types';

export function makeUnitOfMeasure(
  overrides: Partial<UnitOfMeasureRow> = {},
): UnitOfMeasureRow {
  return {
    id: 'uom-1',
    code: 'KG',
    name: 'Kilogram',
    decimalPlaces: 3,
    isActive: true,
    inUse: false,
    ...overrides,
  };
}
