import type { NotificationResponse } from '@/types/api/notifications';
import type { NotificationTarget } from '../types/types';

/** Where a click on a notification leads, by the kind of record it is about; null = only mark it read. */
export function getNotificationTarget(
  notification: Pick<NotificationResponse, 'entityId' | 'entityType'>,
): NotificationTarget | null {
  const { entityId, entityType } = notification;
  switch (entityType) {
    case 'WAREHOUSE':
      return entityId
        ? { to: '/warehouses/$warehouseId', params: { warehouseId: entityId } }
        : { to: '/warehouses' };
    case 'SUPPLIER':
      return { to: '/suppliers' };
    case 'CATEGORY':
      return { to: '/categories' };
    case 'UNIT_OF_MEASURE':
      return { to: '/units-of-measure' };
    default:
      return null;
  }
}

/** A notification counts as unread unless the backend says it was read. */
export function isUnreadNotification(
  notification: Pick<NotificationResponse, 'read'>,
): boolean {
  return notification.read !== true;
}

/** The backend's unread total, or the unread rows on this page when absent. */
export function getUnreadCount(
  page:
    | { unreadCount: number | null; content: NotificationResponse[] | null }
    | null
    | undefined,
): number {
  if (!page) {
    return 0;
  }
  if (typeof page.unreadCount === 'number') {
    return page.unreadCount;
  }
  return (page.content ?? []).filter((row) => isUnreadNotification(row)).length;
}
