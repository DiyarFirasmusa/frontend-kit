import {
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table';

// Module scope: a new features object per render would rebuild the table.
export const dataTableFeatures = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
  columnVisibilityFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableColumn<TRow extends RowData> = ColumnDef<
  DataTableFeatures,
  TRow
>;
export type TableStatus = 'loading' | 'refetching' | 'error' | 'ready';
