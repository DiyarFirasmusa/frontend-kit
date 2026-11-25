import type { useTranslation as useTranslationType } from 'react-i18next';
import type { WarehouseResponse } from '@/types/api/warehouses';
import type { ExportColumn } from '@/types/export';
import { activeBadge } from '@/utils/status-tones';
import { warehouseTypeLabelKey } from './warehouse-status';

type TFn = ReturnType<typeof useTranslationType>['t'];

function text(value: string | null): string | null {
  return value?.trim() || null;
}

/** Excel columns of the warehouses list, with the on-screen labels. */
export function getWarehouseExportColumns(
  t: TFn,
): ExportColumn<WarehouseResponse>[] {
  return [
    { header: t('warehouses.col.code'), value: (row) => text(row.code) },
    { header: t('warehouses.col.name'), value: (row) => text(row.name) },
    { header: t('warehouses.col.address'), value: (row) => text(row.address) },
    {
      header: t('warehouses.col.manager'),
      value: (row) =>
        text(row.managerName) ?? row.managerUserId ?? row.managerEmployeeId,
    },
    { header: t('warehouses.col.members'), value: (row) => row.memberCount },
    {
      header: t('warehouses.col.locations'),
      value: (row) => row.locationCount,
    },
    {
      header: t('warehouses.col.type'),
      value: (row) => t(warehouseTypeLabelKey(row.isTransit)),
    },
    {
      header: t('warehouses.col.status'),
      value: (row) =>
        row.isActive === null ? null : t(activeBadge(row.isActive).labelKey),
    },
  ];
}
