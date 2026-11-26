import type { NotificationPageResponse } from '../src/types/api/notifications';
import { expect, loginAs, test } from './fixtures/app';

const NOTIFICATIONS: NotificationPageResponse = {
  unreadCount: 1,
  content: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      type: 'INFO',
      title: 'Warehouse BGD-01 was added',
      message: 'Review its details and members',
      entityId: '22222222-2222-4222-8222-222222222222',
      entityType: 'WAREHOUSE',
      createdAt: '2026-03-01T09:30:00',
      read: false,
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      type: 'WARNING',
      title: 'A supplier has no contact details',
      message: null,
      entityId: null,
      entityType: 'SUPPLIER',
      createdAt: '2026-02-28T14:05:00',
      read: true,
    },
  ],
  page: 0,
  size: 10,
  totalElements: 2,
  totalPages: 1,
};

const BELL = /^(Notifications|الإشعارات)/;
const PANEL = /^(Notifications|الإشعارات)/;

test.describe('notifications', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.backend();
    await mockApi.json('**/api/notifications*', NOTIFICATIONS);
    await loginAs(page, mockApi);
  });

  test('shows the unread count, lists notifications and opens the target on click', async ({
    page,
    dir,
  }) => {
    const marked: string[] = [];
    await page.route('**/api/notifications/*/read', (route) => {
      marked.push(route.request().url());
      return route.fulfill({ status: 204 });
    });

    await page.goto('/warehouses');
    await expect(
      page.getByRole('table').getByText('WH-BGD-01', { exact: true }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', dir);

    const bell = page.getByRole('button', { name: BELL });
    await expect(bell).toHaveAccessibleName(/1 (unread|غير مقروءة)/);
    await expect(
      bell.locator('[data-slot="notifications-count"]'),
    ).toBeVisible();

    await bell.click();
    const panel = page.getByRole('dialog', { name: PANEL });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('listitem')).toHaveCount(2);
    await expect(panel.getByText(/^(Information|معلومة)$/)).toBeVisible();
    await expect(
      panel.getByText(/^(Needs attention|يحتاج انتباهك)$/),
    ).toBeVisible();

    await panel
      .getByRole('button', { name: /Warehouse BGD-01 was added/ })
      .click();

    await expect(page).toHaveURL(
      /\/warehouses\/22222222-2222-4222-8222-222222222222/,
    );
    await expect.poll(() => marked.length).toBe(1);
    expect(marked[0]).toContain(
      '/api/notifications/11111111-1111-4111-8111-111111111111/read',
    );
  });

  test('opens the supplier list without marking a read item again', async ({
    page,
  }) => {
    const marked: string[] = [];
    await page.route('**/api/notifications/*/read', (route) => {
      marked.push(route.request().url());
      return route.fulfill({ status: 204 });
    });

    await page.goto('/warehouses');
    await expect(
      page.getByRole('table').getByText('WH-BGD-01', { exact: true }),
    ).toBeVisible();

    await page.getByRole('button', { name: BELL }).click();
    await page
      .getByRole('dialog', { name: PANEL })
      .getByRole('button', { name: /A supplier has no contact details/ })
      .click();

    await expect(page).toHaveURL(/\/suppliers$/);
    expect(marked).toHaveLength(0);
  });
});
