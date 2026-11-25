import { describe, expect, it } from 'vitest';
import {
  getNotificationTarget,
  getUnreadCount,
  isUnreadNotification,
} from './notification-target';

describe('getNotificationTarget', () => {
  it('opens the warehouse detail page when the notification names a warehouse', () => {
    expect(
      getNotificationTarget({ entityType: 'WAREHOUSE', entityId: 'wh-1' }),
    ).toEqual({
      to: '/warehouses/$warehouseId',
      params: { warehouseId: 'wh-1' },
    });
  });

  it('falls back to the warehouse list without an id', () => {
    expect(
      getNotificationTarget({ entityType: 'WAREHOUSE', entityId: null }),
    ).toEqual({ to: '/warehouses' });
  });

  it.each([
    ['SUPPLIER', '/suppliers'],
    ['CATEGORY', '/categories'],
    ['UNIT_OF_MEASURE', '/units-of-measure'],
  ])('sends a %s notification to %s', (entityType, to) => {
    expect(getNotificationTarget({ entityType, entityId: null })).toEqual({
      to,
    });
  });

  it('returns null when there is nowhere to go', () => {
    expect(getNotificationTarget({ entityType: null, entityId: null })).toBe(
      null,
    );
    expect(
      getNotificationTarget({ entityType: 'SOMETHING_ELSE', entityId: 'x' }),
    ).toBe(null);
  });
});

describe('unread helpers', () => {
  it('counts a notification as unread unless it was read', () => {
    expect(isUnreadNotification({ read: false })).toBe(true);
    expect(isUnreadNotification({ read: null })).toBe(true);
    expect(isUnreadNotification({ read: true })).toBe(false);
  });

  it('prefers the backend total and falls back to the rows on the page', () => {
    expect(getUnreadCount({ unreadCount: 7, content: [] })).toBe(7);
    expect(
      getUnreadCount({
        unreadCount: null,
        content: [
          {
            id: 'a',
            type: 'INFO',
            title: null,
            message: null,
            entityId: null,
            entityType: null,
            createdAt: null,
            read: false,
          },
          {
            id: 'b',
            type: 'INFO',
            title: null,
            message: null,
            entityId: null,
            entityType: null,
            createdAt: null,
            read: true,
          },
        ],
      }),
    ).toBe(1);
    expect(getUnreadCount(null)).toBe(0);
  });
});
