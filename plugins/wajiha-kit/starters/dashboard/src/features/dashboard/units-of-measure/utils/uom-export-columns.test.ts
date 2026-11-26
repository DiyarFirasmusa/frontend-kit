import { describe, expect, it } from 'vitest';
import i18n from '@/lib/i18n/i18n';
import { makeUnitOfMeasure } from '../uom-test-utils';
import { getUnitOfMeasureExportColumns } from './uom-export-columns';

describe('getUnitOfMeasureExportColumns', () => {
  it('writes the on-screen labels and the status as text', () => {
    const columns = getUnitOfMeasureExportColumns(i18n.t.bind(i18n));
    const row = makeUnitOfMeasure({ isActive: false, inUse: true });
    expect(columns.map((column) => column.value(row))).toEqual([
      'KG',
      'Kilogram',
      3,
      i18n.t('unitsOfMeasure.inUse.yes'),
      i18n.t('common.inactive'),
    ]);
  });
});
