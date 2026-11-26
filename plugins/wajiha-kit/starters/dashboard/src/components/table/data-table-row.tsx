import type { ColumnAlign } from '@/types/table';

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

/** Body row and cell height: the `--row-h` token (comfortable 62px, compact 52px). */
export const ROW_HEIGHT_CLASS = 'h-(--row-h)';

/**
 * The sticky actions cell needs its own opaque background (rows scroll under
 * it), so it follows the row's hover, focus and open-menu states explicitly.
 */
export const STICKY_ACTIONS_CELL_CLASS =
  'bg-surface group-hover/row:bg-hover-row group-focus-visible/row:bg-hover-row group-has-aria-expanded/row:bg-hover-row sticky end-0 transition-colors duration-150';

export function alignClass(align?: ColumnAlign): string {
  if (align === 'center') {
    return 'text-center';
  }
  if (align === 'end') {
    return 'text-end';
  }
  return 'text-start';
}
