import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Column, ColumnAlign } from '@/types/table';

const ROW_CLICK_IGNORE =
  'button, a, [role="button"], [role="menuitem"], input, label, [data-no-row-click]';

/** Header-strip and sticky-action surface tint (one value, used by every header cell). */
export const TABLE_HEADER_TINT =
  'bg-[color-mix(in_oklab,var(--text-primary)_3.5%,var(--surface))]';

/** Height of the empty, error and skeleton state cells, in 3.5rem row units. */
export function stateHeightClass(rows: number): string {
  if (rows >= 8) {
    return 'h-[28rem]';
  }
  if (rows >= 5) {
    return 'h-72';
  }
  return 'h-56';
}

export function alignClass(align?: ColumnAlign): string {
  if (align === 'center') {
    return 'text-center';
  }
  if (align === 'end') {
    return 'text-end';
  }
  return 'text-start';
}

interface DataTableRowProps<T> {
  row: T;
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  /** Extra row classes, e.g. the selected-row tint. */
  className?: string;
  /** Marks the row as selected for assistive tech and styling hooks. */
  selected?: boolean;
}

export function DataTableRow<T>({
  row,
  columns,
  onRowClick,
  className,
  selected,
}: DataTableRowProps<T>) {
  const clickable = !!onRowClick;
  return (
    <TableRow
      tabIndex={clickable ? 0 : undefined}
      data-selected={selected || undefined}
      onClick={
        clickable
          ? (e) => {
              const ignored = (e.target as HTMLElement).closest(
                ROW_CLICK_IGNORE,
              );
              if (ignored && ignored !== e.currentTarget) {
                return;
              }
              onRowClick(row);
            }
          : undefined
      }
      onKeyDown={
        clickable
          ? (e) => {
              if (
                (e.key === 'Enter' || e.key === ' ') &&
                (e.target as HTMLElement) === e.currentTarget
              ) {
                e.preventDefault();
                onRowClick(row);
              }
            }
          : undefined
      }
      className={cn(
        'border-stroke-subtle h-[62px] border-b transition-colors duration-150 last:border-0',
        clickable &&
          'focus-visible:bg-hover-row focus-visible:ring-ring/40 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-inset',
        className,
      )}
    >
      {columns.map((col) => (
        <TableCell
          key={col.id}
          className={cn(
            'text-b2 text-text-primary h-[62px] px-4 py-2 align-middle',
            alignClass(col.align),
            col.id === 'actions' && 'bg-surface sticky end-0',
            col.cellClassName,
          )}
        >
          {col.cell
            ? col.cell(row)
            : col.accessor
              ? ((col.accessor(row) as React.ReactNode) ?? '—')
              : null}
        </TableCell>
      ))}
    </TableRow>
  );
}
