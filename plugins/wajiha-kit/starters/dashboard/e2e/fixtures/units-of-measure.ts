import type { UnitOfMeasureResponse } from '@/types/api/catalog';
import type { MockApi } from './app';

export const UNITS: UnitOfMeasureResponse[] = [
  {
    id: 'uom-1',
    code: 'PCS',
    name: 'Piece',
    decimalPlaces: 0,
    isActive: true,
    inUse: null,
  },
  {
    id: 'uom-2',
    code: 'KG',
    name: 'Kilogram',
    decimalPlaces: 3,
    isActive: true,
    inUse: null,
  },
  {
    id: 'uom-3',
    code: 'MTR',
    name: 'Meter',
    decimalPlaces: 2,
    isActive: false,
    inUse: null,
  },
];

/** GET /api/units-of-measure returns a plain array (no paging). */
export async function mockUnitsOfMeasure(mockApi: MockApi): Promise<void> {
  await mockApi.json('**/api/units-of-measure*', UNITS);
}
