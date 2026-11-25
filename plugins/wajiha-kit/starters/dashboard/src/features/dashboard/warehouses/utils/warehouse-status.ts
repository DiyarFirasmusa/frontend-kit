import type { BadgeTone } from '@/components/table/data-badge';

export function warehouseTypeBadge(isTransit: boolean | null): {
  tone: BadgeTone;
  labelKey: string;
} {
  if (isTransit === true) {
    return { tone: 'info', labelKey: 'warehouses.type.transit' };
  }
  return { tone: 'neutral', labelKey: 'warehouses.type.regular' };
}

export function warehouseTypeLabelKey(isTransit: boolean | null): string {
  return warehouseTypeBadge(isTransit).labelKey;
}
