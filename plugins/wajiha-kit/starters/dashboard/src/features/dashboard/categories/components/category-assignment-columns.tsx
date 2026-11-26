import { createColumnHelper } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { DataTableFeatures } from '@/components/table/table-features';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Lock } from '@/lib/icons';
import type { AssignmentRow } from '../types/types';

const helper = createColumnHelper<DataTableFeatures, AssignmentRow>();

interface AssignmentColumnsDeps {
  t: TFunction;
  canWrite: boolean;
  onToggleRequired: (row: AssignmentRow, value: boolean) => void;
  onToggleVariantAxis: (row: AssignmentRow, value: boolean) => void;
  onEditOptions: (row: AssignmentRow) => void;
  onDetach: (row: AssignmentRow) => void;
}

/** An inherited assignment belongs to a parent category: read-only here. */
function isLocked(row: AssignmentRow, canWrite: boolean): boolean {
  return (
    !canWrite || row.inherited === true || row.attributeDefinitionId === null
  );
}

/** The linked attributes of one category. The API does not sort this list: no column sorts. */
export function getCategoryAssignmentColumns({
  t,
  canWrite,
  onToggleRequired,
  onToggleVariantAxis,
  onEditOptions,
  onDetach,
}: AssignmentColumnsDeps) {
  return helper.columns([
    helper.display({
      id: 'attribute',
      enableSorting: false,
      header: t('categories.assignments.col.attribute'),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-text-primary text-h5">
            {row.original.attributeName ?? '—'}
          </span>
          {row.original.inherited ? (
            <span className="text-brand-text text-b3 inline-flex items-center gap-1">
              <Lock className="size-3.5 shrink-0" aria-hidden />
              {t('categories.assignments.inheritedReadonly')}
            </span>
          ) : null}
        </div>
      ),
    }),
    helper.display({
      id: 'dataType',
      enableSorting: false,
      header: t('categories.assignments.col.dataType'),
      cell: ({ row }) =>
        row.original.dataType
          ? t(`enums.AttributeDataType.${row.original.dataType}`)
          : '—',
      meta: { hideBelow: 'md' },
    }),
    helper.display({
      id: 'source',
      enableSorting: false,
      header: t('categories.assignments.col.source'),
      cell: ({ row }) => row.original.sourceName,
      meta: { hideBelow: 'md' },
    }),
    helper.display({
      id: 'required',
      enableSorting: false,
      header: t('categories.assignments.col.required'),
      cell: ({ row }) => (
        <Switch
          aria-label={t('categories.assignments.col.required')}
          checked={row.original.isRequired ?? false}
          disabled={isLocked(row.original, canWrite)}
          onCheckedChange={(value) => {
            onToggleRequired(row.original, value);
          }}
        />
      ),
    }),
    helper.display({
      id: 'variantAxis',
      enableSorting: false,
      header: t('categories.assignments.col.variantAxis'),
      cell: ({ row }) => (
        <Switch
          aria-label={t('categories.assignments.col.variantAxis')}
          checked={row.original.isVariantAxis ?? false}
          disabled={isLocked(row.original, canWrite)}
          onCheckedChange={(value) => {
            onToggleVariantAxis(row.original, value);
          }}
        />
      ),
    }),
    helper.display({
      id: 'options',
      enableSorting: false,
      header: t('categories.assignments.col.options'),
      cell: ({ row }) =>
        row.original.dataType === 'OPTION' && canWrite ? (
          <Button
            variant="link"
            size="sm"
            className="text-brand-text px-0"
            aria-label={t('categories.assignments.editOptionsRow', {
              name: row.original.attributeName ?? '',
            })}
            onClick={() => {
              onEditOptions(row.original);
            }}
          >
            {t('categories.assignments.editOptions')}
          </Button>
        ) : (
          '—'
        ),
      meta: { hideBelow: 'lg' },
    }),
    helper.display({
      id: 'actions',
      enableSorting: false,
      header: () => (
        <span className="sr-only">
          {t('categories.assignments.col.actions')}
        </span>
      ),
      cell: ({ row }) =>
        canWrite && !row.original.inherited ? (
          <Button
            variant="ghost"
            size="sm"
            aria-label={t('categories.assignments.detachRow', {
              name: row.original.attributeName ?? '',
            })}
            onClick={() => {
              onDetach(row.original);
            }}
          >
            {t('categories.assignments.detach')}
          </Button>
        ) : (
          '—'
        ),
      meta: { align: 'end' },
    }),
  ]);
}
