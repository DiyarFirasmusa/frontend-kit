import type { BadgeTone } from '@/components/table/data-badge';
import type { NotificationType } from '@/types/api/notifications';

export const NOTIFICATION_TYPE_TONE: Record<NotificationType, BadgeTone> = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
};
