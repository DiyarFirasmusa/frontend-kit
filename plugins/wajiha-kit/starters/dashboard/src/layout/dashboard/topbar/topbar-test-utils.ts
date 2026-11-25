import { HttpResponse, http } from 'msw';
import { endpoints } from '@/constants/api';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import type { NotificationPageResponse } from '@/types/api/notifications';
import type { GlobalSearchResponse } from './types/types';

export const SEARCH_RESPONSE: GlobalSearchResponse = {
  warehouses: [
    { id: 'wh-1', code: 'BGD-01', name: 'Central warehouse', isActive: true },
  ],
  suppliers: [
    { id: 'sup-1', code: 'SUP-001', name: 'Acme Supplies', isActive: true },
  ],
  categories: [
    { id: 'cat-1', code: 'CAT-01', name: 'Packaging', isActive: false },
  ],
  units: [{ id: 'uom-1', code: 'BOX', name: 'Box', isActive: true }],
};

/** Stub `GET /api/search` and collect the `q` / `limit` of every request. */
export function mockSearch(
  body: GlobalSearchResponse | { status: number } = SEARCH_RESPONSE,
): { requests: URLSearchParams[] } {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(api(endpoints.search.query), ({ request }) => {
      requests.push(new URL(request.url).searchParams);
      if ('status' in body) {
        return HttpResponse.json({ message: 'boom' }, { status: body.status });
      }
      return HttpResponse.json(body);
    }),
  );
  return { requests };
}

export const NOTIFICATIONS_PAGE: NotificationPageResponse = {
  unreadCount: 1,
  content: [
    {
      id: 'n-1',
      type: 'INFO',
      title: 'Warehouse BGD-01 was added',
      message: 'Review its details and members',
      entityId: 'wh-1',
      entityType: 'WAREHOUSE',
      createdAt: '2026-03-01T09:30:00',
      read: false,
    },
    {
      id: 'n-2',
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

export const EMPTY_NOTIFICATIONS_PAGE: NotificationPageResponse = {
  unreadCount: 0,
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
};

/** Stub `GET /api/notifications` and collect the query of every request. */
export function mockNotifications(
  body: NotificationPageResponse | { status: number } = NOTIFICATIONS_PAGE,
): { requests: URLSearchParams[] } {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(api(endpoints.notifications.list), ({ request }) => {
      requests.push(new URL(request.url).searchParams);
      if ('status' in body) {
        return HttpResponse.json({ message: 'boom' }, { status: body.status });
      }
      return HttpResponse.json(body);
    }),
  );
  return { requests };
}

/** Stub `POST /api/notifications/{id}/read` and collect the marked ids. */
export function mockMarkRead(): { ids: string[] } {
  const ids: string[] = [];
  server.use(
    http.post(api(endpoints.notifications.read(':id')), ({ params }) => {
      ids.push(String(params.id));
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return { ids };
}
