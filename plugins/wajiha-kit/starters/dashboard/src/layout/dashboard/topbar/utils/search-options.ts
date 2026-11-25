import type {
  GlobalSearchGroup,
  GlobalSearchOption,
  GlobalSearchResponse,
  GlobalSearchSection,
} from '../types/types';

export const SEARCH_GROUP_ORDER: readonly GlobalSearchGroup[] = [
  'warehouses',
  'suppliers',
  'categories',
  'units',
];

/** Flat, ordered option list (one block per resource) from a search response. */
export function buildSearchOptions(
  data?: GlobalSearchResponse,
): GlobalSearchOption[] {
  if (!data) {
    return [];
  }
  return SEARCH_GROUP_ORDER.flatMap((group) =>
    (data[group] ?? []).map((hit) => ({
      id: hit.id,
      group,
      title: hit.name ?? hit.code,
      subtitle: hit.name ? hit.code : null,
      inactive: hit.isActive === false,
    })),
  );
}

export function groupSearchOptions(
  options: GlobalSearchOption[],
): GlobalSearchSection[] {
  return SEARCH_GROUP_ORDER.map((group) => ({
    group,
    options: options
      .map((option, index) => ({ option, index }))
      .filter((entry) => entry.option.group === group),
  })).filter((section) => section.options.length > 0);
}
