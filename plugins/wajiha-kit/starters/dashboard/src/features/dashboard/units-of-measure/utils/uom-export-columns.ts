import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/types/export';
import { activeBadge } from '@/utils/status-tones';
import type { UnitOfMeasureRow } from '../types/types';

/** Excel columns of the units of measure list, with the on-screen labels. */
export function getUnitOfMeasureExportColumns(
  t: TFunction,
): ExportColumn<UnitOfMeasureRow>[] {
  return [
    { header: t('unitsOfMeasure.columns.code'), value: (row) => row.code },
    { header: t('unitsOfMeasure.columns.name'), value: (row) => row.name },
    {
      header: t('unitsOfMeasure.columns.decimalPlaces'),
      value: (row) => row.decimalPlaces,
    },
    {
      header: t('unitsOfMeasure.columns.inUse'),
      value: (row) =>
        row.inUse === true
          ? t('unitsOfMeasure.inUse.yes')
          : t('unitsOfMeasure.inUse.no'),
    },
    {
      header: t('unitsOfMeasure.columns.status'),
      value: (row) => t(activeBadge(row.isActive).labelKey),
    },
  ];
}
