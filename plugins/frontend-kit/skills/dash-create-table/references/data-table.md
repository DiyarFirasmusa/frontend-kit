# Shared DataTable on TanStack Table v9

Built once per project in `src/components/table/`. Checked against
`@tanstack/react-table` 9.x: `useTable`, `tableFeatures`, `rowPaginationFeature`,
`rowSortingFeature`, `rowSelectionFeature`, `columnVisibilityFeature`,
`createColumnHelper<TFeatures, TData>()`, `functionalUpdate`, `table.FlexRender`,
`rowCount`, `manualPagination`, `manualSorting`, `getRowId`.

> The project pins v8 (`useReactTable`, `getCoreRowModel`, `flexRender`)?
> Same structure: `createColumnHelper<TData>()`, add
> `getCoreRowModel: getCoreRowModel()`, and render with `flexRender(...)`.

## table-features.ts

```ts
import {
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table';

// Module scope: a new features object per render would rebuild the table.
export const dataTableFeatures = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableColumn<TRow extends RowData> = ColumnDef<DataTableFeatures, TRow>;
export type TableStatus = 'loading' | 'refetching' | 'error' | 'ready';
```

## table-state.ts (`src/utils/table-state.ts`)

```ts
import type { PaginationState, SortingState } from '@tanstack/react-table';

export function toPaginationState(page: number, pageSize: number): PaginationState {
  return { pageIndex: page - 1, pageSize };
}

/** URL sort is `<columnId>.<asc|desc>`; anything else means "no sort". */
export function toSortingState(sort: string): SortingState {
  const [id, direction] = sort.split('.');
  if (!id || (direction !== 'asc' && direction !== 'desc')) {
    return [];
  }
  return [{ id, desc: direction === 'desc' }];
}

export function toSortParam(sorting: SortingState): string {
  const first = sorting.at(0);
  return first ? `${first.id}.${first.desc ? 'desc' : 'asc'}` : '';
}

export function toTableStatus(query: {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
}): TableStatus {
  if (query.isError) {
    return 'error';
  }
  if (query.isPending) {
    return 'loading';
  }
  return query.isFetching ? 'refetching' : 'ready';
}
```

(`TableStatus` imported from `@/components/table/table-features`.)

## data-table.tsx

```tsx
import {
  functionalUpdate,
  useTable,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortDirection,
  type SortingState,
} from '@tanstack/react-table';
import type { AriaAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTablePagination } from './data-table-pagination';
import { DataTableSkeletonRows } from './data-table-skeleton-rows';
import { DataTableStateRow } from './data-table-state-row';
import { SortIcon } from './sort-icon';
import {
  dataTableFeatures,
  type DataTableColumn,
  type TableStatus,
} from './table-features';

const NO_SELECTION: RowSelectionState = {};

interface DataTableProps<TRow extends RowData> {
  caption: string;
  columns: Array<DataTableColumn<TRow>>;
  /** Must be referentially stable (query data or a module-level empty array). */
  rows: TRow[];
  rowCount: number | undefined;
  getRowId: (row: TRow) => string;
  pagination: PaginationState;
  sorting: SortingState;
  onPaginationChange: (next: PaginationState) => void;
  onSortingChange: (next: SortingState) => void;
  status: TableStatus;
  onRetry: () => void;
  /** Rendered when the page has no rows: empty state or "no results" + clear filters. */
  empty: ReactNode;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;
}

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

export function DataTable<TRow extends RowData>(props: DataTableProps<TRow>) {
  const { t } = useTranslation();
  const selection = props.rowSelection ?? NO_SELECTION;
  const table = useTable({
    features: dataTableFeatures,
    columns: props.columns,
    data: props.rows,
    getRowId: props.getRowId,
    rowCount: props.rowCount ?? 0,
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: props.onRowSelectionChange !== undefined,
    state: { pagination: props.pagination, sorting: props.sorting, rowSelection: selection },
    // The URL owns this state: resolve the updater, hand the result up, keep nothing here.
    onPaginationChange: (updater) => {
      props.onPaginationChange(functionalUpdate(updater, props.pagination));
    },
    onSortingChange: (updater) => {
      props.onSortingChange(functionalUpdate(updater, props.sorting));
    },
    onRowSelectionChange: (updater) => {
      props.onRowSelectionChange?.(functionalUpdate(updater, selection));
    },
  });
  const columnCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-3">
      <div className="border-border relative overflow-x-auto rounded-xl border">
        {props.status === 'refetching' ? (
          <div className="bg-primary absolute inset-x-0 top-0 h-0.5 animate-pulse" aria-hidden="true" />
        ) : null}
        <table className="w-full text-sm" aria-busy={props.status === 'loading' || props.status === 'refetching'}>
          <caption className="sr-only">{props.caption}</caption>
          <thead className="bg-surface-dim">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={toAriaSort(canSort, sorted)}
                      className="px-3 py-2 text-start font-medium whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex min-h-11 items-center gap-1 rounded focus-visible:ring-2"
                        >
                          <table.FlexRender header={header} />
                          <SortIcon direction={sorted} />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {props.status === 'loading' ? (
              <DataTableSkeletonRows rows={props.pagination.pageSize} columns={columnCount} />
            ) : props.status === 'error' ? (
              <DataTableStateRow columns={columnCount}>
                <p>{t('table.loadError')}</p>
                <button type="button" onClick={props.onRetry} className="min-h-11">
                  {t('common.retry')}
                </button>
              </DataTableStateRow>
            ) : rows.length === 0 ? (
              <DataTableStateRow columns={columnCount}>{props.empty}</DataTableStateRow>
            ) : (
              rows.map((row) => (
                <tr key={row.id} aria-selected={row.getIsSelected() || undefined} className="border-border border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <DataTablePagination
        pageIndex={props.pagination.pageIndex}
        pageSize={props.pagination.pageSize}
        pageCount={table.getPageCount()}
        rowCount={props.rowCount}
        canPrevious={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
        onPrevious={() => {
          table.previousPage();
        }}
        onNext={() => {
          table.nextPage();
        }}
        onPageSize={(size: number) => {
          table.setPageSize(size);
        }}
      />
    </div>
  );
}
```

Pieces kept in their own files (each small, each tested):

- `data-table-skeleton-rows.tsx` — `rows × columns` cells with fixed-height
  bars, `aria-hidden`, so the swap to real rows does not shift layout.
- `data-table-state-row.tsx` — one `<tr><td colSpan={columns}>` centred block.
- `sort-icon.tsx` — up / down / neutral icon, `aria-hidden` (the `<th>`
  carries `aria-sort`).
- `data-table-pagination.tsx` — `<nav aria-label={t('table.pagination')}>`,
  previous / next buttons (icons `rtl:-scale-x-100`), "page X of Y · N results"
  in an `aria-live="polite"` region, page-size `<select>` with a label. Every
  button ≥ 44px.
- `data-table-row-actions.tsx` — renders `RowAction[]`: inline icon buttons
  (`aria-label` per row) for one or two, a menu beyond. An action with a
  `disabledReasonKey` stays focusable: `aria-disabled="true"`, the reason linked
  with `aria-describedby`, and a click handler that returns before `onSelect`
  (`aria-disabled` blocks nothing). Test: click it, assert `onSelect` was not called.
- `data-table-bulk-bar.tsx` — count + actions + clear, shown when the
  selection is not empty.

## Selection column (only for bulk actions)

```tsx
export function selectionColumn<TRow extends RowData>(
  helper: ReturnType<typeof createColumnHelper<DataTableFeatures, TRow>>,
  labels: { all: string; row: (row: TRow) => string },
) {
  return helper.display({
    id: 'select',
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label={labels.all}
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked) => {
          table.toggleAllPageRowsSelected(checked);
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={labels.row(row.original)}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => {
          row.toggleSelected(checked);
        }}
      />
    ),
  });
}
```

`Checkbox` is the project's primitive; adapt the prop names to it.

## Column meta

```ts
// src/types/table.ts
import type { CellData, RowData, TableFeatures } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    align?: 'start' | 'end';
    hideBelow?: 'sm' | 'md' | 'lg';
  }
}
```

Type parameters must match the library's declaration exactly (names,
constraints and the `in out` modifiers); copy them from the installed
`ColumnDef.d.ts` if a version bump changes them. `DataTable` reads `meta` to
add `text-end` and the responsive `hidden … :table-cell` classes to both the
`<th>` and its `<td>`s.

## Tests for the shared table

- `table-state.test.ts`: every branch of the converters and `toTableStatus`.
- `data-table.test.tsx`: each status renders the right body; a sortable header
  is a button and `<th aria-sort>` follows the state; clicking it calls
  `onSortingChange` with the next sort; next/previous call
  `onPaginationChange`; the header checkbox selects only the current page.
