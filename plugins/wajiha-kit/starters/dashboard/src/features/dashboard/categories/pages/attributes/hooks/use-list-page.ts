import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import { PERMS } from '@/constants/permissions';
import { useDeleteDialog } from '@/hooks/use-delete-dialog';
import { useClampPage } from '@/hooks/use-list-search';
import { toTableStatus } from '@/utils/table-state';
import { useAttributeDefinitionsList } from '../../../hooks/query/use-attribute-definitions';
import { useDeleteAttributeDefinition } from '../../../hooks/query/use-attribute-mutations';
import type { AttributeRow } from '../../../types/types';
import { getAttributeColumns } from '../components/attribute-columns';
import { toAttributeListParams } from '../utils/list-params';
import { getAttributeRowActions } from './attribute-actions';
import { useAttributeFilters } from './filter/use-attribute-filters';
import type { AttributeDialogState } from './form/use-attribute-form-dialog';

const NO_ROWS: AttributeRow[] = [];

export function getAttributeRowId(row: AttributeRow): string {
  return row.id;
}

/** Everything the attributes list needs; the container only renders it. */
export function useAttributesListPage() {
  const { t } = useTranslation();
  const can = useCan();
  const filters = useAttributeFilters();
  const query = useAttributeDefinitionsList(
    toAttributeListParams(filters.search),
  );
  const [dialog, setDialog] = useState<AttributeDialogState>({
    kind: 'closed',
  });
  const remove = useDeleteDialog(
    useDeleteAttributeDefinition(),
    (row: AttributeRow) => row.name ?? row.code ?? '',
  );
  const { openDelete } = remove;

  const getActions = useCallback(
    (row: AttributeRow) =>
      getAttributeRowActions(row, {
        t,
        can,
        onEdit: (target) => {
          setDialog({ kind: 'edit', attributeId: target.id });
        },
        onEditOptions: (target) => {
          setDialog({ kind: 'options', attributeId: target.id });
        },
        onDelete: openDelete,
      }),
    [t, can, openDelete],
  );
  const columns = useMemo(
    () => getAttributeColumns({ t, getActions }),
    [t, getActions],
  );

  useClampPage(filters.search.page, query.data?.totalPages, filters.goToPage);

  return {
    t,
    rows: query.data?.content ?? NO_ROWS,
    rowCount: query.data?.totalElements,
    status: toTableStatus(query),
    retry: () => {
      void query.refetch();
    },
    columns,
    pagination: filters.pagination,
    sorting: filters.sorting,
    setPagination: filters.setPagination,
    setSorting: filters.setSorting,
    hasFilters: filters.hasFilters,
    clearFilters: filters.clear,
    canCreate: can(PERMS.attributeDefinition.create),
    openCreate: () => {
      setDialog({ kind: 'create' });
    },
    dialog,
    closeDialog: () => {
      setDialog({ kind: 'closed' });
    },
    deleteDialog: remove.dialog,
  };
}
