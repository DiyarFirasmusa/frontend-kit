import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Column, ServerPagination } from '@/components/table/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronsUpDown, ChevronUp, SlidersHorizontal } from '@/components/ui/icons';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/shared/utils/cn';
import { DataTableEmpty } from './data-table-empty';
import { DataTableError } from './data-table-error';
import { DataTablePagination } from './data-table-pagination';
import { alignClass, DataTableRow, TABLE_HEADER_TINT } from './data-table-row';
import { filterRows, sortRows } from './data-table-rows';
import { DataTableSkeleton } from './data-table-skeleton';

type SortDir = 'asc' | 'desc';

export interface TableSort {
  id: string;
  dir: SortDir;
}

interface TableSelection {
  selectedIds: Set<string>;
  onChange: (ids: Set<string>) => void;

  bulkActions?: ReactNode;
  /** Where the checkbox column sits: first (default) or last, as in 07.04. */
  position?: 'start' | 'end';
  /** Hide the header "select all" checkbox. */
  hideSelectAll?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  search?: string;
  isLoading?: boolean;
  skeletonRows?: number;

  isError?: boolean;
  errorLabel?: string;
  onRetry?: () => void;

  serverPagination?: ServerPagination;
  /** With server pagination, sort is applied by the request. Pass `onSortChange` to keep the header control. */
  sortState?: TableSort | null;
  onSortChange?: (sort: TableSort) => void;

  selection?: TableSelection;

  enableColumnVisibility?: boolean;
  onRowClick?: (row: T) => void;
  noResultsLabel?: string;
  /** Panel title shown above the table, with the row count beside it. */
  title?: string;
  /**
   * Drop the table's own bordered, padded panel. Use when the table sits
   * inside a `surface-card` that already provides the border and padding.
   */
  embedded?: boolean;
  /** Classes added to every selected row (with `selection`). */
  selectedRowClassName?: string;
  /** Extra classes per row, e.g. to mark the active row without selection. */
  rowClassName?: (row: T) => string | undefined;
  /** Accessible name of the table. */
  'aria-label'?: string;
  className?: string;
}

const SELECT_COLUMN_ID = '__select__';

export function DataTable<T>({
  data,
  columns,
  getRowId,
  search,
  isLoading,
  skeletonRows = 6,
  isError,
  errorLabel,
  onRetry,
  serverPagination,
  sortState,
  onSortChange,
  selection,
  enableColumnVisibility,
  onRowClick,
  noResultsLabel,
  title,
  embedded = false,
  selectedRowClassName,
  rowClassName,
  'aria-label': ariaLabel,
  className,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  const [clientSort, setClientSort] = useState<TableSort | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const serverSorted = Boolean(serverPagination);
  const sortInteractive = serverSorted ? Boolean(onSortChange) : true;
  const sort = serverSorted ? (sortState ?? null) : clientSort;

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable || !sortInteractive) {
      return;
    }
    const next: TableSort =
      sort?.id === col.id
        ? { id: col.id, dir: sort.dir === 'asc' ? 'desc' : 'asc' }
        : { id: col.id, dir: 'asc' };
    if (serverSorted) {
      onSortChange?.(next);
      return;
    }
    setClientSort(next);
  };

  const filtered = useMemo(
    () => (serverPagination ? data : filterRows(data, columns, search)),
    [data, search, columns, serverPagination],
  );

  const sorted = useMemo(
    () => (serverSorted ? filtered : sortRows(filtered, columns, clientSort)),
    [filtered, clientSort, columns, serverSorted],
  );

  const stateRows = serverPagination
    ? Math.min(skeletonRows, Math.max(serverPagination.pageSize, 1))
    : skeletonRows;

  const allIds = useMemo(() => sorted.map((row) => getRowId(row)), [sorted, getRowId]);
  const selectedCount = selection ? allIds.filter((id) => selection.selectedIds.has(id)).length : 0;
  const allSelected = selectedCount > 0 && selectedCount === allIds.length;

  const visibleColumns = useMemo(() => columns.filter((c) => !hidden.has(c.id)), [columns, hidden]);
  const renderColumns = useMemo<Column<T>[]>(() => {
    if (!selection) {
      return visibleColumns;
    }
    const toggleAll = () => {
      selection.onChange(allSelected ? new Set() : new Set(allIds));
    };
    const toggleRow = (id: string) => {
      const next = new Set(selection.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      selection.onChange(next);
    };
    const selectCol: Column<T> = {
      id: SELECT_COLUMN_ID,
      className: 'w-10',
      header: selection.hideSelectAll ? (
        <span className="sr-only">{t('ui.selectRow')}</span>
      ) : (
        <Checkbox
          checked={allSelected}
          onCheckedChange={toggleAll}
          aria-label={t('ui.selectAll')}
        />
      ),
      // The row's own click handler ignores clicks on controls (data-table-row.tsx).
      cell: (row) => (
        <Checkbox
          checked={selection.selectedIds.has(getRowId(row))}
          onCheckedChange={() => {
            toggleRow(getRowId(row));
          }}
          aria-label={t('ui.selectRow')}
        />
      ),
    };
    return selection.position === 'end'
      ? [...visibleColumns, selectCol]
      : [selectCol, ...visibleColumns];
  }, [selection, visibleColumns, allSelected, allIds, getRowId, t]);

  const toggleableColumns = columns.filter((c) => c.id !== 'actions' && c.id !== SELECT_COLUMN_ID);
  const hasTopBar = Boolean(enableColumnVisibility || (selection && selectedCount > 0));

  const count = serverPagination?.total ?? sorted.length;

  return (
    <div
      data-slot="data-table"
      data-embedded={embedded || undefined}
      className={cn(
        'space-y-row min-w-0',
        !embedded && 'border-stroke bg-surface p-panel rounded-(--radius-modal) border',
        className,
      )}
    >
      {title ? (
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-h4 text-text-primary">{title}</h2>
          <span className="text-b3 text-text-muted tabular-nums">{count}</span>
        </div>
      ) : null}
      {hasTopBar ? (
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {selection && selectedCount > 0 ? (
              <>
                <span className="text-text-secondary text-sm">
                  {t('ui.selectedCount', { count: selectedCount })}
                </span>
                {selection.bulkActions}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    selection.onChange(new Set());
                  }}
                >
                  {t('ui.clearSelection')}
                </Button>
              </>
            ) : null}
          </div>
          {enableColumnVisibility ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-9 gap-2')}
                data-slot="button"
              >
                <SlidersHorizontal className="size-4 opacity-70" />
                {t('ui.columns')}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{t('ui.columns')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {toggleableColumns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={!hidden.has(col.id)}
                    onCheckedChange={(show) => {
                      setHidden((prev) => {
                        const next = new Set(prev);
                        if (show) {
                          next.delete(col.id);
                        } else {
                          next.add(col.id);
                        }
                        return next;
                      });
                    }}
                  >
                    {typeof col.header === 'string' ? col.header : col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl">
        <Table className="border-collapse" aria-label={ariaLabel}>
          <TableHeader className={cn(TABLE_HEADER_TINT, '[&_tr:hover]:bg-transparent')}>
            <TableRow className="border-stroke-subtle">
              {renderColumns.map((col) => {
                const active = sort?.id === col.id;
                const canSort = Boolean(col.sortable && sortInteractive);
                return (
                  <TableHead
                    key={col.id}
                    aria-sort={
                      canSort
                        ? active
                          ? sort.dir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                    className={cn(
                      'text-table-header text-text-muted h-9 px-4 select-none',
                      alignClass(col.align),
                      col.id === 'actions' && `sticky end-0 ${TABLE_HEADER_TINT}`,
                      col.className,
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className="hover:text-text-primary inline-flex items-center gap-1"
                      >
                        {col.header}
                        {active ? (
                          sort.dir === 'asc' ? (
                            <ChevronUp className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeleton columns={renderColumns} rows={stateRows} />
            ) : isError ? (
              <DataTableError colSpan={renderColumns.length} label={errorLabel} onRetry={onRetry} />
            ) : sorted.length === 0 ? (
              <DataTableEmpty colSpan={renderColumns.length} label={noResultsLabel} />
            ) : (
              sorted.map((row) => {
                const id = getRowId(row);
                const isSelected = selection?.selectedIds.has(id) ?? false;
                return (
                  <DataTableRow
                    key={id}
                    row={row}
                    columns={renderColumns}
                    onRowClick={onRowClick}
                    selected={isSelected}
                    className={cn(isSelected && selectedRowClassName, rowClassName?.(row))}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isError && serverPagination ? (
        <DataTablePagination
          page={serverPagination.page}
          totalPages={serverPagination.totalPages}
          total={serverPagination.total}
          pageSize={serverPagination.pageSize}
          onPageChange={serverPagination.onPageChange}
        />
      ) : null}
    </div>
  );
}
