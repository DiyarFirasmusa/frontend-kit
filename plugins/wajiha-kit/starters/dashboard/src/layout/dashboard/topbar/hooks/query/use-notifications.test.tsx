import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createHookWrapper } from '@/test/hook-wrapper';
import {
  mockMarkRead,
  mockNotifications,
  NOTIFICATIONS_PAGE,
} from '../../topbar-test-utils';
import {
  useMarkNotificationRead,
  useNotificationsList,
} from './use-notifications';

describe('useNotificationsList', () => {
  it('requests the first page of ten and returns the page as sent', async () => {
    const { requests } = mockNotifications();
    const { wrapper } = createHookWrapper();
    const { result } = renderHook(() => useNotificationsList(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(NOTIFICATIONS_PAGE);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.get('page')).toBe('0');
    expect(requests[0]?.get('size')).toBe('10');
  });

  it('surfaces a failed request as an error', async () => {
    mockNotifications({ status: 500 });
    const { wrapper } = createHookWrapper();
    const { result } = renderHook(() => useNotificationsList(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useMarkNotificationRead', () => {
  it('posts to the read endpoint and refetches the notifications list', async () => {
    const { requests } = mockNotifications();
    const { ids } = mockMarkRead();
    const { wrapper } = createHookWrapper();
    const { result } = renderHook(
      () => ({ list: useNotificationsList(), mark: useMarkNotificationRead() }),
      { wrapper },
    );
    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true);
    });

    await act(async () => {
      await result.current.mark.mutateAsync('n-1');
    });

    expect(ids).toEqual(['n-1']);
    await waitFor(() => {
      expect(requests).toHaveLength(2);
    });
  });
});
