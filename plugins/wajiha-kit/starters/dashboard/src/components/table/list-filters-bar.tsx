import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RefreshCw } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { ResolvedTableFilter } from '@/types/table';
import { ListFilterSelect } from './list-filter-select';
import { ListFilterToggle } from './list-filter-toggle';
import { ListSearchField } from './list-search-field';

/** A one-tap boolean filter, rendered as a bordered checkbox tile. */
export interface ListQuickChip {
  id: string;
  label: string;
  active: boolean;
  count?: number;
  /** Called on every toggle; flip `active` in the caller. */
  onSelect: () => void;
}

/** A control the caller renders itself (lookup, date range), placed by `id`. */
export interface ListExtraFilter {
  id: string;
  node: ReactNode;
}

export interface ListFiltersBarProps {
  /** Omit `onSearchChange` (or pass `hideSearch`) to render the bar without a search field. */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Accessible name of the search field; defaults to "Search". */
  searchLabel?: string;
  /** Shows a fixed context in the search slot instead of a live search. */
  searchReadOnly?: boolean;
  hideSearch?: boolean;
  /** Compact dropdowns, always visible. An empty one reads the filter name. */
  filters?: ResolvedTableFilter[];
  filterValues?: Record<string, string>;
  onFilterChange?: (id: string, value: string) => void;
  /** @deprecated Put every filter in `filters`; merged after them. */
  moreFilters?: ResolvedTableFilter[];
  /** Boolean quick filters, shown as checkbox tiles. */
  quickChips?: ListQuickChip[];
  /** Extra always-visible controls (date inputs, lookups), placed after the dropdowns. Ordered as `extra`. */
  extraFilters?: ReactNode;
  /** Extra controls with their own id, so `order` can place each one. */
  extras?: ListExtraFilter[];
  /** @deprecated The bar no longer collapses, so no active-filter badge is shown. */
  extraActiveCount?: number;
  /**
   * Control ids in display order (start to end): `search`, `extra`, a filter
   * id, a quick chip id or an extra id. Controls left out follow in the
   * default order: search, filters, extra, extras, quick chips.
   */
  order?: string[];
  onClearFilters?: () => void;
  isDirty?: boolean;
  resetLabel?: string;
  className?: string;
}

const SEARCH_ID = 'search';
const EXTRA_ID = 'extra';

/**
 * Inline list toolbar of the list frames (02.01, 04.01, 07.01, 09.01, 13.01):
 * search, compact dropdowns, checkbox tiles and any extra controls in one
 * wrapping row. It has no panel of its own; place it in the same
 * `surface-card` as the table.
 */
export function ListFiltersBar({
  search = '',
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  searchReadOnly,
  hideSearch = false,
  filters = [],
  filterValues = {},
  onFilterChange,
  moreFilters = [],
  quickChips = [],
  extraFilters,
  extras = [],
  order = [],
  onClearFilters,
  isDirty = false,
  resetLabel,
  className,
}: ListFiltersBarProps) {
  const { t } = useTranslation();

  const controls = new Map<string, ReactNode>();
  if (!hideSearch && (onSearchChange || searchReadOnly)) {
    controls.set(
      SEARCH_ID,
      <ListSearchField
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder ?? t('common.search')}
        label={searchLabel}
        readOnly={searchReadOnly}
      />,
    );
  }
  for (const filter of [...filters, ...moreFilters]) {
    controls.set(
      filter.id,
      <ListFilterSelect
        id={`filter-${filter.id}`}
        label={filter.label}
        value={filterValues[filter.id] ?? ''}
        options={filter.options}
        disabled={filter.disabled}
        allowAll={filter.allowAll}
        prefixLabel={filter.prefixLabel}
        onChange={(value) => {
          onFilterChange?.(filter.id, value);
        }}
      />,
    );
  }
  if (extraFilters !== undefined && extraFilters !== null) {
    controls.set(EXTRA_ID, extraFilters);
  }
  for (const extra of extras) {
    controls.set(extra.id, extra.node);
  }
  for (const chip of quickChips) {
    controls.set(
      chip.id,
      <ListFilterToggle
        label={chip.label}
        checked={chip.active}
        count={chip.count}
        onCheckedChange={() => {
          chip.onSelect();
        }}
      />,
    );
  }

  const ids = [
    ...order.filter((id) => controls.has(id)),
    ...[...controls.keys()].filter((id) => !order.includes(id)),
  ];

  return (
    <div className={cn('gap-field flex flex-wrap items-center', className)}>
      {ids.map((id) => (
        <Fragment key={id}>{controls.get(id)}</Fragment>
      ))}
      {isDirty && onClearFilters ? (
        <Button
          type="button"
          variant="ghost"
          className="text-text-secondary h-10 gap-2 px-2"
          onClick={() => {
            onSearchChange?.('');
            onClearFilters();
          }}
        >
          <RefreshCw className="size-4" />
          {resetLabel ?? t('common.reset')}
        </Button>
      ) : null}
    </div>
  );
}
