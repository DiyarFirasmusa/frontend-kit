import type { SupplierStatus } from '../types/api';

/**
 * The list state that lives in the URL (?q=&status=&page=), so a filtered page can be shared, reloaded
 * and walked with the back button. Unknown or broken values are dropped, never trusted.
 */
export type SuppliersSearch = {
  q?: string;
  status?: SupplierStatus;
  /** 1-based, like the URL a person reads. */
  page?: number;
};

export const SUPPLIERS_PAGE_SIZE = 10;

export function parseSuppliersSearch(raw: Record<string, unknown>): SuppliersSearch {
  const search: SuppliersSearch = {};
  if (typeof raw['q'] === 'string' && raw['q'].trim() !== '') {
    search.q = raw['q'].trim().slice(0, 100);
  }
  if (raw['status'] === 'active' || raw['status'] === 'inactive') {
    search.status = raw['status'];
  }
  const page = Number(raw['page']);
  if (Number.isInteger(page) && page > 1) {
    search.page = page;
  }
  return search;
}
