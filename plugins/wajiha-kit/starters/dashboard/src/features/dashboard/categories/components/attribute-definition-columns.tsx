import type { useTranslation as useTranslationType } from 'react-i18next';
import { DataBadge } from '@/components/table/data-badge';
import { DataTableRowActions } from '@/components/table/data-table-row-actions';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import type { Column } from '@/types/table';
import { activeBadge } from '@/utils/status-tones';
import { getAttributeRowActions } from '../hooks/attribute-actions';

type TFn = ReturnType<typeof useTranslationType>['t'];

interface GetAttributeDefinitionColumnsArgs {
  t: TFn;
  canWrite: boolean;
  canDelete: boolean;
  onEdit: (row: AttributeDefinitionResponse) => void;
  onEditOptions: (row: AttributeDefinitionResponse) => void;
  onDelete: (row: AttributeDefinitionResponse) => void;
}

export function getAttributeDefinitionColumns({
  t,
  canWrite,
  canDelete,
  onEdit,
  onEditOptions,
  onDelete,
}: GetAttributeDefinitionColumnsArgs): Column<AttributeDefinitionResponse>[] {
  return [
    {
      id: 'name',
      header: t('categories.attributes.col.name'),
      accessor: (row) => row.name,
      cell: (row) => (
        <span className="text-text-primary text-h5">{row.name ?? '—'}</span>
      ),
    },
    {
      id: 'code',
      header: t('categories.attributes.col.code'),
      accessor: (row) => row.code,
      cellClassName: 'font-mono',
    },
    {
      id: 'dataType',
      header: t('categories.attributes.col.dataType'),
      accessor: (row) => row.dataType,
      cell: (row) =>
        row.dataType ? t(`enums.AttributeDataType.${row.dataType}`) : '—',
    },
    {
      id: 'unit',
      header: t('categories.attributes.col.unit'),
      accessor: (row) => row.unitLabel ?? '—',
    },
    {
      id: 'options',
      header: t('categories.attributes.col.options'),
      accessor: (row) => row.dataType,
      cell: (row) =>
        row.dataType === 'OPTION' ? (row.options?.length ?? 0) : '—',
    },
    {
      id: 'status',
      header: t('categories.attributes.col.status'),
      accessor: (row) => row.isActive,
      cell: (row) => {
        const badge = activeBadge(row.isActive);
        return (
          <DataBadge tone={badge.tone} shape="pill">
            {t(badge.labelKey)}
          </DataBadge>
        );
      },
    },
    {
      id: 'actions',
      header: t('categories.attributes.col.actions'),
      align: 'end',
      cell: (row) => (
        <DataTableRowActions
          actions={getAttributeRowActions({
            t,
            row,
            canWrite,
            canDelete,
            onEdit,
            onEditOptions,
            onDelete,
          })}
        />
      ),
    },
  ];
}
