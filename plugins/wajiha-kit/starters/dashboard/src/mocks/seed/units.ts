import { type UnitOfMeasureResponse } from '@/types/api/catalog';
/** Units of measure. */
import { makeId } from './base';

// Units of measure
// ---------------------------------------------------------------------------

const UOM_SEEDS: [string, string, number, boolean, boolean][] = [
  // code, name, decimalPlaces, isActive, inUse
  ['PCS', 'قطعة', 0, true, true],
  ['BOX', 'علبة', 0, true, true],
  ['CTN', 'كرتونة', 0, true, true],
  ['BAG', 'كيس', 0, true, true],
  ['KG', 'كيلوغرام', 3, true, true],
  ['G', 'غرام', 2, true, false],
  ['L', 'لتر', 2, true, true],
  ['M', 'متر', 2, true, true],
  ['ROLL', 'لفة', 0, true, true],
  ['SET', 'طقم', 0, true, false],
  ['DOZ', 'درزن', 0, true, true],
  ['TON', 'طن', 3, false, false],
];

export const unitsOfMeasure: UnitOfMeasureResponse[] = UOM_SEEDS.map(
  ([code, name, decimalPlaces, isActive, inUse], i) => ({
    id: makeId(0xb0, i + 1),
    code,
    name,
    decimalPlaces,
    isActive,
    inUse,
  }),
);
