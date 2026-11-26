import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/types/export';
import { activeBadge } from '@/utils/status-tones';
import type { WarehouseRow } from '../types/types';

function text(value: string | null): string | null {
  return value?.trim() || null;
}

/** Excel columns of the warehouses list, with the on-screen labels. */
export function getWarehouseExportColumns(
  t: TFunction,
): ExportColumn<WarehouseRow>[] {
  return [
    { header: t('warehouses.columns.code'), value: (row) => text(row.code) },
    { header: t('warehouses.columns.name'), value: (row) => text(row.name) },
    {
      header: t('warehouses.columns.address'),
      value: (row) => text(row.address),
    },
    {
      header: t('warehouses.columns.manager'),
      value: (row) =>
        text(row.managerName) ?? row.managerUserId ?? row.managerEmployeeId,
    },
    {
      header: t('warehouses.columns.members'),
      value: (row) => row.memberCount,
    },
    {
      header: t('warehouses.columns.locations'),
      value: (row) => row.locationCount,
    },
    {
      header: t('warehouses.columns.type'),
      value: (row) =>
        row.isTransit === true
          ? t('warehouses.type.transit')
          : t('warehouses.type.regular'),
    },
    {
      header: t('warehouses.columns.status'),
      value: (row) =>
        row.isActive === null ? null : t(activeBadge(row.isActive).labelKey),
    },
  ];
}
