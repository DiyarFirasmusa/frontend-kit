import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { NotificationResponse } from '@/types/api/notifications';
import type { NotificationsMenuState } from '../types/types';
import {
  getNotificationTarget,
  getUnreadCount,
  isUnreadNotification,
} from '../utils/notification-target';
import {
  useMarkNotificationRead,
  useMarkNotificationsRead,
  useNotificationsList,
} from './query/use-notifications';

export function useNotificationsMenu(): NotificationsMenuState {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const query = useNotificationsList();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkNotificationsRead();

  const onOpenChange = (next: boolean) => {
    setIsOpen(next);
    if (next) {
      void query.refetch();
    }
  };

  const onSelect = (notification: NotificationResponse) => {
    if (isUnreadNotification(notification)) {
      markRead.mutate(notification.id);
    }
    setIsOpen(false);
    const target = getNotificationTarget(notification);
    if (target) {
      void navigate(target);
    }
  };

  return {
    isOpen,
    onOpenChange,
    unreadCount: getUnreadCount(query.data),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    data: query.data,
    retry: () => {
      void query.refetch();
    },
    onSelect,
    onMarkAllRead: () => {
      const unreadIds = (query.data?.content ?? [])
        .filter((notification) => isUnreadNotification(notification))
        .map((notification) => notification.id);
      if (unreadIds.length > 0) {
        markAllRead.mutate(unreadIds);
      }
    },
    isMarkingAllRead: markAllRead.isPending,
  };
}
