import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type { NotificationPageResponse } from '@/types/api/notifications';
import type { NotificationListParams } from '../types/types';

export async function fetchNotifications(
  params: NotificationListParams,
  signal?: AbortSignal,
): Promise<NotificationPageResponse> {
  const { data } = await privateApi.get<NotificationPageResponse>(
    endpoints.notifications.list,
    { params, signal, silentError: true },
  );
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await privateApi.post(endpoints.notifications.read(id), undefined, {
    silent: true,
  });
}

export async function markNotificationsRead(
  ids: readonly string[],
): Promise<void> {
  await Promise.all(ids.map((id) => markNotificationRead(id)));
}
