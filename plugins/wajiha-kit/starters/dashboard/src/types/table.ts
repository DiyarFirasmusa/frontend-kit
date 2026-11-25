import type { ReactNode } from 'react';

export type ColumnAlign = 'start' | 'center' | 'end';

export type Column<T> = {
  id: string;
  header: ReactNode;
  accessor?: (row: T) => string | number | boolean | null | undefined;
  cell?: (row: T) => ReactNode;
  className?: string;
  cellClassName?: string;

  align?: ColumnAlign;

  sortable?: boolean;

  sortValue?: (row: T) => string | number;
};

export type TableFilterOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ResolvedTableFilter = {
  id: string;
  label: string;
  options: TableFilterOption[];
  disabled?: boolean;
  /** Offer "All" as the first option (default). Off for required choices such as a sort order. */
  allowAll?: boolean;
  /** Prefix the picked value with the filter name. Defaults to `!allowAll`. */
  prefixLabel?: boolean;
};

export interface ServerPagination {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}
