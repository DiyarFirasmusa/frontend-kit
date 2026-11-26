import type { useTranslation as useTranslationType } from 'react-i18next';
import type { ExportColumn } from '@/types/export';
import { activeBadge } from '@/utils/status-tones';
import type { SupplierRow } from '../types/types';

type TFn = ReturnType<typeof useTranslationType>['t'];

function text(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

/** Excel columns of the suppliers list, with the on-screen labels. */
export function getSupplierExportColumns(t: TFn): ExportColumn<SupplierRow>[] {
  return [
    { header: t('suppliers.columns.code'), value: (row) => text(row.code) },
    { header: t('suppliers.columns.name'), value: (row) => text(row.name) },
    {
      header: t('suppliers.dialog.contactName'),
      value: (row) => text(row.contactName),
    },
    { header: t('suppliers.columns.phone'), value: (row) => text(row.phone) },
    { header: t('suppliers.columns.email'), value: (row) => text(row.email) },
    {
      header: t('suppliers.columns.taxNumber'),
      value: (row) => text(row.taxNumber),
    },
    {
      header: t('suppliers.dialog.address'),
      value: (row) => text(row.address),
    },
    {
      header: t('suppliers.columns.inUse'),
      value: (row) =>
        row.inUse === true ? t('suppliers.inUse.yes') : t('suppliers.inUse.no'),
    },
    {
      header: t('suppliers.columns.status'),
      value: (row) => t(activeBadge(row.isActive).labelKey),
    },
  ];
}
