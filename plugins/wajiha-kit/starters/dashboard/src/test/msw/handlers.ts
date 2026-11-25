import { HttpResponse, http } from 'msw';
import { endpoints } from '@/constants/api';
import type { NotificationPageResponse } from '@/types/api/notifications';
import type { WorkspaceResponse } from '@/types/api/workspace';
import { makeLoginResponse, makeRefreshResponse } from '../fixtures/auth';

/** Base URL injected by vitest.config.ts (`VITE_API_BASE_URL`). */
const API = 'http://api.test';

/** Auth base URL injected by vitest.config.ts (`VITE_AUTH_BASE_URL`). */
const AUTH = 'http://auth.test';

/** Absolute URL for an endpoint path on the inventory API. */
export function api(path: string): string {
  return `${API}${path === '' || path.startsWith('/') ? '' : '/'}${path}`;
}

/** Absolute URL for an endpoint path on the auth service. */
export function authApi(path: string): string {
  return `${AUTH}${path === '' || path.startsWith('/') ? '' : '/'}${path}`;
}

const workspace: WorkspaceResponse = {
  name: 'الشركة التجريبية',
  code: 'DEMO-01',
};

const emptyNotifications: NotificationPageResponse = {
  unreadCount: 0,
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

/**
 * Default happy-path handlers. Override per test with
 * `server.use(http.get(api(...), () => HttpResponse.json(...)))`.
 */
export const handlers = [
  http.post(authApi(endpoints.auth.login), async ({ request }) => {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    if (body.username === 'admin' && body.password === 'secret') {
      return HttpResponse.json(makeLoginResponse());
    }
    return HttpResponse.json(
      {
        non_field_errors: [
          'No active account found with the given credentials',
        ],
      },
      { status: 400 },
    );
  }),

  http.post(authApi(endpoints.auth.refresh), () =>
    HttpResponse.json(makeRefreshResponse()),
  ),

  http.post(
    authApi(endpoints.auth.logout),
    () => new HttpResponse(null, { status: 200 }),
  ),

  http.post(
    authApi(endpoints.auth.changePassword),
    () => new HttpResponse(null, { status: 200 }),
  ),

  http.get(api(endpoints.auth.me), () =>
    HttpResponse.json({
      userId: 'user-1',
      tenantId: 'tenant-1',
      username: 'admin',
      displayName: 'Ali Karkhi',
      firstName: 'Ali',
      lastName: 'Karkhi',
      jobTitle: 'Storekeeper',
      orgUnitName: 'Baghdad branch',
      avatarUrl: null,
      roles: ['SUPERADMIN'],
      permissions: ['warehouse:read'],
      scopes: {},
    }),
  ),

  http.get(api(endpoints.workspace.detail), () => HttpResponse.json(workspace)),

  http.get(api(endpoints.directory.roles), () => HttpResponse.json([])),

  http.post(api(endpoints.directory.resolve), () => HttpResponse.json([])),

  http.get(api(endpoints.directory.search), () => HttpResponse.json([])),

  http.get(api(endpoints.notifications.list), () =>
    HttpResponse.json(emptyNotifications),
  ),
];
