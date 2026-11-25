import { Popover } from '@base-ui/react/popover';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { DataBadge } from '@/components/table/data-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { Bell, Check } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { NotificationResponse } from '@/types/api/notifications';
import { formatDateTime } from '@/utils/format';
import { useNotificationsMenu } from '../hooks/use-notifications-menu';
import { isUnreadNotification } from '../utils/notification-target';
import { NOTIFICATION_TYPE_TONE } from '../utils/notification-tones';

const SKELETON_ROWS = [0, 1, 2] as const;

function NotificationsSkeleton(): ReactElement {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-busy="true"
      className="space-y-field p-inline"
      data-slot="notifications-loading"
    >
      <span className="sr-only">{t('common.loading')}</span>
      {SKELETON_ROWS.map((row) => (
        <div key={row} aria-hidden className="gap-field flex flex-col">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onSelect,
}: {
  notification: NotificationResponse;
  onSelect: (notification: NotificationResponse) => void;
}): ReactElement {
  const { t } = useTranslation();
  const isUnread = isUnreadNotification(notification);
  const { type, createdAt } = notification;

  return (
    <button
      type="button"
      data-unread={isUnread || undefined}
      onClick={() => {
        onSelect(notification);
      }}
      className={cn(
        'gap-inline p-inline hover:bg-hover-row focus-visible:outline-primary-highlight flex w-full items-start rounded-(--radius-nav) text-start transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2',
        isUnread && 'bg-primary-light hover:bg-primary-light',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          isUnread ? 'bg-primary-highlight' : 'bg-transparent',
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="gap-field flex items-center justify-between">
          {type ? (
            <DataBadge tone={NOTIFICATION_TYPE_TONE[type]}>
              {t(`notifications.types.${type}`)}
            </DataBadge>
          ) : (
            <span />
          )}
          <time
            dir="ltr"
            dateTime={createdAt ?? undefined}
            className="text-b3 text-text-muted shrink-0 tabular-nums"
          >
            {formatDateTime(createdAt ?? undefined)}
          </time>
        </span>
        <span
          dir="auto"
          className={cn('text-text-primary', isUnread ? 'text-h5' : 'text-b2')}
        >
          {notification.title ?? '—'}
        </span>
        {notification.message ? (
          <span dir="auto" className="text-b3 text-text-secondary line-clamp-2">
            {notification.message}
          </span>
        ) : null}
        {isUnread ? (
          <span className="sr-only">{t('notifications.unreadItem')}</span>
        ) : null}
      </span>
    </button>
  );
}

export function NotificationsMenu(): ReactElement {
  const { t } = useTranslation();
  const menu = useNotificationsMenu();
  const hasUnread = menu.unreadCount > 0;
  const unreadLabel = t('notifications.unread', { count: menu.unreadCount });
  const triggerLabel = hasUnread
    ? `${t('notifications.open')}, ${unreadLabel}`
    : t('notifications.open');

  return (
    <Popover.Root open={menu.isOpen} onOpenChange={menu.onOpenChange}>
      <Popover.Trigger
        type="button"
        aria-label={triggerLabel}
        data-slot="notifications-trigger"
        className="topbar-chip"
      >
        <Bell aria-hidden className="size-[18px]" />
        {hasUnread ? (
          <span
            aria-hidden
            data-slot="notifications-count"
            className="tabular-nums"
          >
            {menu.unreadCount}
          </span>
        ) : null}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          positionMethod="fixed"
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50 outline-none"
        >
          <Popover.Popup
            data-slot="notifications-popup"
            className="border-stroke bg-popover text-text-primary shadow-mid data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 flex max-h-[min(32rem,var(--available-height))] w-[min(22.5rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-(--radius-nav) border duration-100 outline-none"
          >
            <div className="border-stroke-subtle gap-inline px-row py-inline flex flex-col items-start border-b">
              <Popover.Title className="text-h4 text-text-primary">
                {hasUnread
                  ? t('notifications.titleWithUnread', {
                      count: menu.unreadCount,
                    })
                  : t('notifications.title')}
              </Popover.Title>
              {hasUnread ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={menu.isMarkingAllRead}
                  onClick={menu.onMarkAllRead}
                >
                  <Check className="size-4" />
                  {t('notifications.markAllRead')}
                </Button>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Wrapper
                isLoading={menu.isLoading}
                isError={menu.isError}
                error={menu.error}
                data={menu.data}
                isEmpty={(page) => (page.content ?? []).length === 0}
                emptyMessage={t('notifications.empty')}
                errorMessage={t('notifications.error')}
                onRetry={menu.retry}
                loadingFallback={<NotificationsSkeleton />}
              >
                {(page) => (
                  <ul className="space-y-1 p-1">
                    {(page.content ?? []).map((notification) => (
                      <li key={notification.id}>
                        <NotificationItem
                          notification={notification}
                          onSelect={menu.onSelect}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Wrapper>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
