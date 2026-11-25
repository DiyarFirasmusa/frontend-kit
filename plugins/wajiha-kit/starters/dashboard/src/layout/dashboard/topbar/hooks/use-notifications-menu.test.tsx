import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createHookWrapper } from '@/test/hook-wrapper';
import {
  mockMarkRead,
  mockNotifications,
  NOTIFICATIONS_PAGE,
} from '../topbar-test-utils';
import { useNotificationsMenu } from './use-notifications-menu';

function setup() {
  const { wrapper } = createHookWrapper();
  return renderHook(() => useNotificationsMenu(), { wrapper });
}

describe('useNotificationsMenu', () => {
  it('loads once on mount and exposes the unread count', async () => {
    const { requests } = mockNotifications();
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.data).toEqual(NOTIFICATIONS_PAGE);
    });
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.isOpen).toBe(false);
    expect(requests).toHaveLength(1);
  });

  it('refetches when opened but not when closed', async () => {
    const { requests } = mockNotifications();
    const { result } = setup();
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    act(() => {
      result.current.onOpenChange(true);
    });
    expect(result.current.isOpen).toBe(true);
    await waitFor(() => {
      expect(requests).toHaveLength(2);
    });

    act(() => {
      result.current.onOpenChange(false);
    });
    expect(result.current.isOpen).toBe(false);
    expect(requests).toHaveLength(2);
  });

  it('closes and marks only unread notifications read on select', async () => {
    mockNotifications();
    const { ids } = mockMarkRead();
    const { result } = setup();
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
    const [unread, read] = NOTIFICATIONS_PAGE.content ?? [];

    act(() => {
      result.current.onOpenChange(true);
    });
    act(() => {
      if (read) {
        result.current.onSelect(read);
      }
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      if (unread) {
        result.current.onSelect(unread);
      }
    });
    await waitFor(() => {
      expect(ids).toEqual(['n-1']);
    });
  });
});
