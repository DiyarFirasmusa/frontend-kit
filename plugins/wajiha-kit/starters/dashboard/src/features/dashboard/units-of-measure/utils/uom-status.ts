import type { BadgeTone } from '@/components/table/data-badge';

export function unitOfMeasureActiveBadge(isActive: boolean | null): {
  tone: BadgeTone;
  labelKey: string;
} {
  if (isActive === true) {
    return { tone: 'success', labelKey: 'unitsOfMeasure.status.active' };
  }
  return { tone: 'neutral', labelKey: 'unitsOfMeasure.status.inactive' };
}
