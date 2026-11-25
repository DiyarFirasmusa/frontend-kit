import type { SelectOption } from '@/components/fields/select-option';

export interface LookupPaging {
  /** True while the server has more pages after the ones loaded. */
  hasMore?: boolean;
  loadMore?: () => void;
  isLoadingMore?: boolean;
  /** Lets a lookup fetch its first page only once its dropdown opens. */
  onOpenChange?: (open: boolean) => void;
}

export interface LookupResult<T> extends LookupPaging {
  options: SelectOption[];
  data: T[];
  isLoading: boolean;
  isError: boolean;
}

/** Spread onto a Combobox / ComboboxField to give it scroll-to-load-more. */
export function comboboxPaging(lookup: LookupPaging) {
  return {
    hasMore: lookup.hasMore,
    onLoadMore: lookup.loadMore,
    isLoadingMore: lookup.isLoadingMore,
    onOpenChange: lookup.onOpenChange,
  };
}
