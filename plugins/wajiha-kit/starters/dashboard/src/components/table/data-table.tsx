import {
  functionalUpdate,
  useTable,
  type PaginationState,
  type RowData,
  type SortDirection,
  type SortingState,
} from '@tanstack/react-table';
import type { AriaAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronsUpDown, ChevronUp } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { ColumnAlign } from '@/types/table';
import { DataTableEmpty } from './data-table-empty';
import { DataTableError } from './data-table-error';
import { DataTablePagination } from './data-table-pagination';
import {
  alignClass,
  STICKY_ACTIONS_CELL_CLASS,
  TABLE_HEADER_TINT,
} from './data-table-row';
import { DataTableSkeleton } from './data-table-skeleton';
import {
  dataTableFeatures,
  type DataTableColumn,
  type TableStatus,
} from './table-features';

export interface DataTableProps<TRow extends RowData> {
  caption: string;
  columns: DataTableColumn<TRow>[];
  /** Must keep its identity between renders (query data or a module constant). */
  rows: TRow[];
  /** Total across every page, from the response (`totalElements`). */
  rowCount: number | undefined;
  getRowId: (row: TRow) => string;
  pagination: PaginationState;
  sorting: SortingState;
  onPaginationChange: (next: PaginationState) => void;
  onSortingChange: (next: SortingState) => void;
  pageSizeOptions?: readonly number[];
  status: TableStatus;
  onRetry: () => void;
  /** Message when the page has no rows: "nothing yet" or "no results". */
  emptyLabel: string;
  /** Action under the empty message: create, or clear filters. */
  emptyAction?: ReactNode;
}

const ACTIONS_COLUMN_ID = 'actions';

/** The part of `ColumnMeta` (augmented in src/types/table.ts) the table reads. */
interface ColumnLayout {
  align?: ColumnAlign;
  hideBelow?: 'md' | 'lg';
}

const HIDE_BELOW: Record<NonNullable<ColumnLayout['hideBelow']>, string> = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

function toAriaSort(
  canSort: boolean,
  sorted: false | SortDirection,
): AriaAttributes['aria-sort'] {
  if (!canSort) {
    return undefined;
  }
  if (sorted === 'asc') {
    return 'ascending';
  }
  return sorted === 'desc' ? 'descending' : 'none';
}

function metaClass(id: string, meta: ColumnLayout | undefined): string {
  return cn(
    alignClass(meta?.align),
    meta?.hideBelow ? HIDE_BELOW[meta.hideBelow] : undefined,
    id === ACTIONS_COLUMN_ID && 'sticky end-0',
  );
}

function SortIcon({ direction }: { direction: false | SortDirection }) {
  if (direction === 'asc') {
    return <ChevronUp aria-hidden className="size-3.5" />;
  }
  if (direction === 'desc') {
    return <ChevronDown aria-hidden className="size-3.5" />;
  }
  return <ChevronsUpDown aria-hidden className="size-3.5 opacity-50" />;
}

/**
 * The list table: TanStack Table with the server doing the paging and
 * sorting. Pagination and sorting are derived from the URL by the page hook;
 * this component resolves TanStack's updaters and hands the result up, it
 * keeps no list state of its own (data-tables.md).
 */
export function DataTable<TRow extends RowData>(props: DataTableProps<TRow>) {
  const { t } = useTranslation();
  const table = useTable({
    features: dataTableFeatures,
    columns: props.columns,
    data: props.rows,
    getRowId: props.getRowId,
    rowCount: props.rowCount ?? 0,
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: false,
    state: { pagination: props.pagination, sorting: props.sorting },
    onPaginationChange: (updater) => {
      props.onPaginationChange(functionalUpdate(updater, props.pagination));
    },
    onSortingChange: (updater) => {
      props.onSortingChange(functionalUpdate(updater, props.sorting));
    },
  });
  const columns = table.getVisibleLeafColumns();
  const rows = table.getRowModel().rows;
  const total = props.rowCount ?? 0;
  const busy = props.status === 'loading' || props.status === 'refetching';
  const showPagination = props.status !== 'loading' && total > 0;

  return (
    <div data-slot="data-table" className="space-y-row relative min-w-0">
      {props.status === 'refetching' ? (
        <div
          aria-hidden
          className="bg-primary absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse"
        />
      ) : null}
      <div className="overflow-hidden rounded-xl">
        <Table className="border-collapse" aria-busy={busy}>
          <caption className="sr-only">{props.caption}</caption>
          <TableHeader
            className={cn(TABLE_HEADER_TINT, '[&_tr:hover]:bg-transparent')}
          >
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="border-stroke-subtle">
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      scope="col"
                      aria-sort={toAriaSort(canSort, sorted)}
                      className={cn(
                        'text-table-header text-text-muted h-9 px-4 select-none',
                        metaClass(
                          header.column.id,
                          header.column.columnDef.meta,
                        ),
                        header.column.id === ACTIONS_COLUMN_ID &&
                          TABLE_HEADER_TINT,
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="hover:text-text-primary inline-flex min-h-9 items-center gap-1"
                        >
                          <table.FlexRender header={header} />
                          <SortIcon direction={sorted} />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {props.status === 'loading' ? (
              <DataTableSkeleton
                columns={columns.map((column) => ({
                  id: column.id,
                  header: null,
                  cellClassName: metaClass(column.id, column.columnDef.meta),
                }))}
                rows={props.pagination.pageSize}
              />
            ) : props.status === 'error' ? (
              <DataTableError
                colSpan={columns.length}
                label={t('common.loadError')}
                onRetry={props.onRetry}
              />
            ) : rows.length === 0 ? (
              <DataTableEmpty colSpan={columns.length} label={props.emptyLabel}>
                {props.emptyAction}
              </DataTableEmpty>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group/row border-stroke-subtle h-[62px] border-b transition-colors duration-150 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'text-b2 text-text-primary h-[62px] px-4 py-2 align-middle',
                          metaClass(cell.column.id, meta),
                          cell.column.id === ACTIONS_COLUMN_ID &&
                            STICKY_ACTIONS_CELL_CLASS,
                          meta?.cellClassName,
                        )}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && props.status !== 'error' ? (
        <DataTablePagination
          page={props.pagination.pageIndex}
          totalPages={Math.max(1, table.getPageCount())}
          total={total}
          pageSize={props.pagination.pageSize}
          onPageChange={(pageIndex) => {
            table.setPageIndex(pageIndex);
          }}
          pageSizeOptions={props.pageSizeOptions}
          onPageSizeChange={(size) => {
            table.setPageSize(size);
          }}
        />
      ) : null}
    </div>
  );
}
