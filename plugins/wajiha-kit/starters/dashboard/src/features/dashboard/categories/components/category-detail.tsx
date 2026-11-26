import type { SortingState } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { ArrowRightLong, FileText, Plus, Trash2 } from '@/lib/icons';
import { toTableStatus } from '@/utils/table-state';
import type { CategoriesPage } from '../hooks/use-categories-page';
import type { AssignmentRow } from '../types/types';

const NO_SORTING: SortingState = [];
const SKELETON_ROWS = 3;

function getAssignmentRowId(row: AssignmentRow): string {
  return row.id;
}

function ignore(): void {
  // The assignments list is neither paged nor sorted by the API.
}

interface CategoryDetailProps {
  page: CategoriesPage;
}

/** The selected category: its details and the table of its linked attributes. */
export function CategoryDetail({ page }: CategoryDetailProps) {
  const { t } = useTranslation();
  const { tree, selected, assignments, can } = page;
  const category = selected.category;
  const rows = assignments.rows;
  // One page that holds every row: the pager is hidden.
  const pagination = useMemo(
    () => ({ pageIndex: 0, pageSize: Math.max(rows.length, SKELETON_ROWS) }),
    [rows.length],
  );

  if (tree.isAllSelected) {
    return (
      <section
        aria-label={t('categories.detail.title')}
        className="surface-card gap-field flex min-w-0 flex-col"
      >
        <h2 className="text-h3 text-text-primary">
          {t('categories.tree.all')}
        </h2>
        {tree.totalItemCount !== null ? (
          <p className="text-b2 text-text-primary tabular-nums">
            {t('categories.detail.allCount', { count: tree.totalItemCount })}
          </p>
        ) : null}
        <p className="text-b2 text-text-secondary">
          {t('categories.detail.allDescription')}
        </p>
      </section>
    );
  }

  if (!category) {
    return (
      <div className="surface-card flex min-w-0 flex-col">
        <p className="text-b2 text-text-secondary">
          {t('categories.detail.empty')}
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label={t('categories.detail.title')}
      className="surface-card gap-card flex min-w-0 flex-col"
    >
      <div className="border-stroke gap-field pb-row flex flex-wrap items-start justify-between border-b">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-b3 text-text-secondary">
            {t('categories.detail.title')}
          </span>
          <h2 className="text-h3 text-text-primary">{category.name ?? '—'}</h2>
          <p className="text-b3 text-text-secondary">
            <span className="sr-only">{t('categories.detail.path')}: </span>
            {selected.path || '—'}
          </p>
          <p className="text-b3 text-text-secondary">
            {t('categories.detail.expiryAlertDays')}:{' '}
            <span className="text-text-primary tabular-nums">
              {typeof category.expiryAlertDays === 'number' &&
              category.expiryAlertDays > 0
                ? t('categories.detail.expiryAlertDaysValue', {
                    days: category.expiryAlertDays,
                  })
                : '—'}
            </span>
          </p>
        </div>
        <div className="gap-field flex flex-wrap items-center">
          {can.update ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={page.openEditSelected}
              >
                <FileText className="size-4" />
                {t('common.edit')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={page.openMoveSelected}
              >
                <ArrowRightLong className="size-4 rtl:rotate-180" />
                {t('categories.actions.move')}
              </Button>
            </>
          ) : null}
          {can.delete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={page.deleteSelected}
            >
              <Trash2 className="size-4" />
              {t('common.delete')}
            </Button>
          ) : null}
        </div>
      </div>

      <section className="gap-field flex flex-col">
        <div className="gap-field flex flex-wrap items-start justify-between">
          <div className="gap-field flex min-w-0 flex-col">
            <h3 className="text-h4 text-text-primary">
              {t('categories.assignments.title')}
            </h3>
            <p className="text-b3 text-text-secondary">
              {t('categories.assignments.description')}
            </p>
          </div>
          {assignments.canAttach ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={page.openAttach}
            >
              <Plus className="size-4" />
              {t('categories.assignments.attach')}
            </Button>
          ) : null}
        </div>
        <DataTable
          caption={t('categories.assignments.caption')}
          columns={assignments.columns}
          rows={rows}
          rowCount={rows.length}
          getRowId={getAssignmentRowId}
          pagination={pagination}
          sorting={NO_SORTING}
          onPaginationChange={ignore}
          onSortingChange={ignore}
          hidePagination
          status={toTableStatus(assignments.query)}
          onRetry={() => {
            void assignments.query.refetch();
          }}
          emptyLabel={t('categories.assignments.empty')}
        />
      </section>
    </section>
  );
}
