import type { useTranslation as useTranslationType } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Lock } from '@/lib/icons';
import type { Column } from '@/types/table';
import type { AssignmentRow } from '../types/types';

type TFn = ReturnType<typeof useTranslationType>['t'];

interface GetCategoryAssignmentColumnsArgs {
  t: TFn;
  canWrite: boolean;
  onToggleRequired: (row: AssignmentRow, value: boolean) => void;
  onToggleVariantAxis: (row: AssignmentRow, value: boolean) => void;
  onEditOptions: (row: AssignmentRow) => void;
  onDetach: (row: AssignmentRow) => void;
}

export function getCategoryAssignmentColumns({
  t,
  canWrite,
  onToggleRequired,
  onToggleVariantAxis,
  onEditOptions,
  onDetach,
}: GetCategoryAssignmentColumnsArgs): Column<AssignmentRow>[] {
  return [
    {
      id: 'attribute',
      header: t('categories.assignments.col.attribute'),
      accessor: (row) => row.attributeName,
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-text-primary text-h5">
            {row.attributeName ?? '—'}
          </span>
          {row.inherited ? (
            <span className="text-warning text-b3 inline-flex items-center gap-1">
              <Lock className="size-3.5 shrink-0" aria-hidden />
              {t('categories.assignments.inheritedReadonly')}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: 'dataType',
      header: t('categories.assignments.col.dataType'),
      accessor: (row) => row.dataType,
      cell: (row) =>
        row.dataType ? t(`enums.AttributeDataType.${row.dataType}`) : '—',
    },
    {
      id: 'source',
      header: t('categories.assignments.col.source'),
      accessor: (row) => row.sourceName,
    },
    {
      id: 'required',
      header: t('categories.assignments.col.required'),
      accessor: (row) => row.isRequired,
      cell: (row) => (
        <Switch
          aria-label={t('categories.assignments.col.required')}
          checked={row.isRequired ?? false}
          disabled={
            !canWrite ||
            row.inherited === true ||
            row.attributeDefinitionId === null
          }
          onCheckedChange={(value) => {
            onToggleRequired(row, value);
          }}
        />
      ),
    },
    {
      id: 'variantAxis',
      header: t('categories.assignments.col.variantAxis'),
      accessor: (row) => row.isVariantAxis,
      cell: (row) => (
        <Switch
          aria-label={t('categories.assignments.col.variantAxis')}
          checked={row.isVariantAxis ?? false}
          disabled={
            !canWrite ||
            row.inherited === true ||
            row.attributeDefinitionId === null
          }
          onCheckedChange={(value) => {
            onToggleVariantAxis(row, value);
          }}
        />
      ),
    },
    {
      id: 'options',
      header: t('categories.assignments.col.options'),
      accessor: (row) => row.dataType,
      cell: (row) =>
        row.dataType === 'OPTION' && canWrite ? (
          <Button
            variant="link"
            size="sm"
            className="text-warning px-0"
            onClick={() => {
              onEditOptions(row);
            }}
          >
            {t('categories.assignments.editOptions')}
          </Button>
        ) : (
          '—'
        ),
    },
    {
      id: 'actions',
      header: t('categories.assignments.col.actions'),
      align: 'end',
      cell: (row) =>
        canWrite && !row.inherited ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onDetach(row);
            }}
          >
            {t('categories.assignments.detach')}
          </Button>
        ) : (
          '—'
        ),
    },
  ];
}
