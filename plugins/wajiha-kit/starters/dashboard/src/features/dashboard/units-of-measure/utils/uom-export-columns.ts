import type { useTranslation as useTranslationType } from 'react-i18next';
import type { ExportColumn } from '@/types/export';
import type { UnitOfMeasureRow } from '../types/types';
import { unitOfMeasureActiveBadge } from './uom-status';

type TFn = ReturnType<typeof useTranslationType>['t'];

/** Excel columns of the units of measure list, with the on-screen labels. */
export function getUnitOfMeasureExportColumns(
  t: TFn,
): ExportColumn<UnitOfMeasureRow>[] {
  return [
    { header: t('unitsOfMeasure.col.code'), value: (row) => row.code },
    { header: t('unitsOfMeasure.col.name'), value: (row) => row.name },
    {
      header: t('unitsOfMeasure.col.decimalPlaces'),
      value: (row) => row.decimalPlaces,
    },
    {
      header: t('unitsOfMeasure.col.status'),
      value: (row) => t(unitOfMeasureActiveBadge(row.isActive).labelKey),
    },
  ];
}
