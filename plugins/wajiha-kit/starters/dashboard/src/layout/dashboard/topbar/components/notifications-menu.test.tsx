import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithRouter, screen, waitFor, within } from '@/test/render';
import {
  EMPTY_NOTIFICATIONS_PAGE,
  mockMarkRead,
  mockNotifications,
  NOTIFICATIONS_PAGE,
} from '../topbar-test-utils';
import { NotificationsMenu } from './notifications-menu';

function trigger() {
  return screen.getByRole('button', {
    name: new RegExp(`^${tt('notifications.open')}`),
  });
}

function count() {
  return document.querySelector('[data-slot="notifications-count"]');
}

async function openMenu() {
  const view = await renderWithRouter(<NotificationsMenu />, { path: '/' });
  await waitFor(() => {
    expect(trigger()).toBeEnabled();
  });
  await view.user.click(trigger());
  const dialog = await screen.findByRole('dialog', {
    name: new RegExp(tt('notifications.title')),
  });
  return { ...view, dialog };
}

describe('NotificationsMenu', () => {
  it('hides the unread count and keeps the plain name when nothing is unread', async () => {
    mockNotifications(EMPTY_NOTIFICATIONS_PAGE);
    await renderWithRouter(<NotificationsMenu />, { path: '/' });

    expect(
      await screen.findByRole('button', { name: tt('notifications.open') }),
    ).toBeInTheDocument();
    expect(count()).toBeNull();
  });

  it('shows the unread count beside the bell and announces it', async () => {
    mockNotifications();
    await renderWithRouter(<NotificationsMenu />, { path: '/' });

    const unread = tt('notifications.unread', { count: 1 });
    expect(
      await screen.findByRole('button', {
        name: `${tt('notifications.open')}, ${unread}`,
      }),
    ).toBeInTheDocument();
    expect(count()).toHaveTextContent('1');
  });

  it('refetches on open and lists type, title, message and time', async () => {
    const { requests } = mockNotifications();
    const { dialog } = await openMenu();

    expect(
      await within(dialog).findByText(tt('notifications.types.INFO')),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(tt('notifications.types.WARNING')),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('Warehouse BGD-01 was added'),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('Review its details and members'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('2026-03-01 09:30')).toBeInTheDocument();
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(2);
    expect(
      within(dialog).getAllByText(tt('notifications.unreadItem')),
    ).toHaveLength(1);
    await waitFor(() => {
      expect(requests).toHaveLength(2);
    });
    expect(requests[1]?.get('size')).toBe('10');
  });

  it('shows the empty state', async () => {
    mockNotifications(EMPTY_NOTIFICATIONS_PAGE);
    const { dialog } = await openMenu();

    expect(
      await within(dialog).findByText(tt('notifications.empty')),
    ).toBeInTheDocument();
  });

  it('shows the error with a retry that reloads the list', async () => {
    mockNotifications({ status: 500 });
    const { dialog, user } = await openMenu();

    const alert = await within(dialog).findByRole('alert');
    expect(alert).toHaveTextContent(tt('notifications.error'));

    mockNotifications();
    await user.click(
      within(alert).getByRole('button', { name: tt('common.tryAgain') }),
    );

    expect(
      await within(dialog).findByText('Warehouse BGD-01 was added'),
    ).toBeInTheDocument();
  });

  it('marks an unread notification read and opens its warehouse', async () => {
    mockNotifications();
    const { ids } = mockMarkRead();
    const { dialog, user, router } = await openMenu();

    await user.click(
      await within(dialog).findByRole('button', {
        name: /Warehouse BGD-01 was added/,
      }),
    );

    await waitFor(() => {
      expect(ids).toEqual(['n-1']);
    });
    expect(router.state.location.pathname).toBe('/warehouses/wh-1');
  });

  it('does not mark a read notification again and opens its supplier list', async () => {
    mockNotifications(NOTIFICATIONS_PAGE);
    const { ids } = mockMarkRead();
    const { dialog, user, router } = await openMenu();

    await user.click(
      await within(dialog).findByRole('button', {
        name: /A supplier has no contact details/,
      }),
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/suppliers');
    });
    expect(ids).toEqual([]);
  });

  it('marks every unread notification read from the menu header', async () => {
    mockNotifications();
    const { ids } = mockMarkRead();
    const { dialog, user } = await openMenu();

    await user.click(
      await within(dialog).findByRole('button', {
        name: tt('notifications.markAllRead'),
      }),
    );

    await waitFor(() => {
      expect(ids).toEqual(['n-1']);
    });
  });

  it('offers no mark-all button when nothing is unread', async () => {
    mockNotifications(EMPTY_NOTIFICATIONS_PAGE);
    const { dialog } = await openMenu();

    await within(dialog).findByText(tt('notifications.empty'));
    expect(
      within(dialog).queryByRole('button', {
        name: tt('notifications.markAllRead'),
      }),
    ).not.toBeInTheDocument();
  });

  it('renders the Arabic title and type labels', async () => {
    mockNotifications();
    await setTestLanguage('ar');
    const { dialog } = await openMenu();

    expect(trigger()).toHaveAccessibleName('الإشعارات, 1 غير مقروءة');
    expect(
      within(dialog).getByText(
        tt('notifications.titleWithUnread', { count: 1 }),
      ),
    ).toBeInTheDocument();
    expect(await within(dialog).findByText('معلومة')).toBeInTheDocument();
    expect(within(dialog).getByText('يحتاج انتباهك')).toBeInTheDocument();
  });
});
