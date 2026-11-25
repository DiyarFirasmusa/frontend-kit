import type { BadgeTone } from '@/components/table/data-badge';

/** A tone and the i18n key of its label: what a status badge needs. */
export interface StatusBadge {
  tone: BadgeTone;
  labelKey: string;
}

/** Active / inactive / unknown as a badge; the one status every list page shares. */
export function activeBadge(isActive: boolean | null): StatusBadge {
  if (isActive === true) {
    return { tone: 'success', labelKey: 'common.active' };
  }
  if (isActive === false) {
    return { tone: 'neutral', labelKey: 'common.inactive' };
  }
  return { tone: 'neutral', labelKey: 'common.unknown' };
}
