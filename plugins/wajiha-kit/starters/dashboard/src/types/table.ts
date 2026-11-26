import type { CellData, RowData, TableFeatures } from '@tanstack/react-table';

export type ColumnAlign = 'start' | 'center' | 'end';

declare module '@tanstack/react-table' {
  // The parameters must match the library's declaration exactly.
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    align?: ColumnAlign;
    /** Hidden below this breakpoint (phones keep the key columns). */
    hideBelow?: 'md' | 'lg';
    /**
     * The column that gives way on a phone: it takes the width the others
     * leave and ellipsizes (never below 7rem), so a name is not cut mid-word
     * by the sticky actions column. The cell content must be able to truncate.
     */
    primary?: boolean;
    /** Extra classes on every <td> of the column. */
    cellClassName?: string;
  }
}
