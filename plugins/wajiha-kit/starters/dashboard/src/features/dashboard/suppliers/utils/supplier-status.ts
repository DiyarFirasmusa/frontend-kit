import type { StatusBadge } from '@/utils/status-tones';
import { activeBadge } from '@/utils/status-tones';
import type { SupplierRow } from '../types/types';

export const UNREGISTERED_BADGE: StatusBadge = {
  tone: 'warning',
  labelKey: 'suppliers.status.unregistered',
};

/** A name seen only on documents shows as unregistered; master rows show active / inactive. */
export function supplierStatusBadge(row: SupplierRow): StatusBadge {
  if (row.registered === false) {
    return UNREGISTERED_BADGE;
  }
  return activeBadge(row.isActive);
}
