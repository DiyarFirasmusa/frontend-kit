import { beforeAll, describe, expect, it } from 'vitest';
import i18n, { loadFeatureLocale } from '@/lib/i18n/i18n';
import { tt } from '@/test/i18n';
import { toExportMatrix } from '@/utils/export-table';
import { makeUnitOfMeasure } from '../uom-test-utils';
import { getUnitOfMeasureExportColumns } from './uom-export-columns';

beforeAll(async () => {
  await loadFeatureLocale('dashboard/units-of-measure');
});

describe('getUnitOfMeasureExportColumns', () => {
  it('uses the on-screen headers and plain cell values', () => {
    const columns = getUnitOfMeasureExportColumns(i18n.t);

    expect(columns.map((column) => column.header)).toEqual([
      tt('unitsOfMeasure.col.code'),
      tt('unitsOfMeasure.col.name'),
      tt('unitsOfMeasure.col.decimalPlaces'),
      tt('unitsOfMeasure.col.status'),
    ]);
    expect(toExportMatrix([makeUnitOfMeasure()], columns)[0]).toEqual([
      'KG',
      'Kilogram',
      3,
      tt('unitsOfMeasure.status.active'),
    ]);
  });

  it('keeps empty values empty', () => {
    const columns = getUnitOfMeasureExportColumns(i18n.t);
    const row = makeUnitOfMeasure({
      name: null,
      decimalPlaces: null,
      isActive: false,
    });

    expect(toExportMatrix([row], columns)[0]?.slice(1)).toEqual([
      null,
      null,
      tt('unitsOfMeasure.status.inactive'),
    ]);
  });
});
