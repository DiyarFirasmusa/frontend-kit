import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import type { NotificationPageResponse } from '@/types/api/notifications';
import {
  fetchNotifications,
  markNotificationRead,
  markNotificationsRead,
} from '../../services/notifications.service';
import type { NotificationListParams } from '../../types/types';

export const NOTIFICATIONS_PARAMS: NotificationListParams = {
  page: 0,
  size: 10,
};

export function useNotificationsList(): UseQueryResult<NotificationPageResponse> {
  return useQuery({
    queryKey: qk.notifications.list(NOTIFICATIONS_PARAMS),
    queryFn: ({ signal }) => fetchNotifications(NOTIFICATIONS_PARAMS, signal),
  });
}

export function useMarkNotificationRead(): UseMutationResult<
  void,
  Error,
  string
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.notifications.all });
    },
  });
}

export function useMarkNotificationsRead(): UseMutationResult<
  void,
  Error,
  readonly string[]
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: readonly string[]) => markNotificationsRead(ids),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: qk.notifications.all });
    },
  });
}
