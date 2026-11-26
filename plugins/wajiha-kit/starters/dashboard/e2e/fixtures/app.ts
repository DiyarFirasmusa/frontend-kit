import { test as base, expect, type Page, type Route } from '@playwright/test';
import { getResponse } from 'msw';
import { endpoints } from '../../src/constants/api';
import { PERMS } from '../../src/constants/permissions';
import { mockHandlers } from '../../src/mocks';
import { resetMockDb } from '../../src/mocks/seed/base';

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface AppOptions {
  /** App language — written to the `lng` cookie before the first navigation. */
  language: Language;
  /** Theme — written to `localStorage.app-theme` before the app boots. */
  theme: Theme;
}

interface AppFixtures {
  /** Route-level API mocks; call before navigating. */
  mockApi: MockApi;
  /** Expected text direction for the current project. */
  dir: 'rtl' | 'ltr';
}

/** API origin (VITE_API_BASE_URL in playwright.config.ts). */
export const API_BASE_URL = 'http://api.e2e.test';

/** Auth service origin (VITE_AUTH_BASE_URL in playwright.config.ts). */
export const AUTH_BASE_URL = 'http://auth.e2e.test';

/** Absolute URL of an auth-service endpoint (the constants may omit the leading slash). */
export function authUrl(path: string): string {
  return `${AUTH_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Every permission PERMS declares — the signed-in e2e user holds all of them. */
export const DEFAULT_PERMISSIONS: string[] = Object.values(PERMS).flatMap(
  (group) => Object.values(group),
);

const TOKEN_HEADER = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));

function base64Url(value: string): string {
  return btoa(value)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

/** Unsigned JWT the app can decode; roles/permissions drive the guarded routes. */
export function makeJwt(
  overrides: { roles?: string[]; permissions?: string[] } = {},
): string {
  const payload = base64Url(
    JSON.stringify({
      token_type: 'access',
      sub: 'user-1',
      tenant_id: 'tenant-1',
      roles: overrides.roles ?? ['ADMIN'],
      permissions: overrides.permissions ?? DEFAULT_PERMISSIONS,
    }),
  );
  return `${TOKEN_HEADER}.${payload}.sig`;
}

/** Answers a routed request with the shared MSW handlers of src/mocks. */
async function fulfillFromMocks(route: Route): Promise<void> {
  const sent = route.request();
  const method = sent.method();
  const request = new Request(sent.url(), {
    method,
    headers: await sent.allHeaders(),
    body:
      method === 'GET' || method === 'HEAD'
        ? undefined
        : (sent.postData() ?? undefined),
  });
  const response = await getResponse(mockHandlers, request);
  if (!response) {
    await route.fulfill({
      status: 501,
      json: { message: `No mock handler for ${method} ${sent.url()}` },
    });
    return;
  }
  await route.fulfill({
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      'access-control-allow-origin': (await sent.headerValue('origin')) ?? '*',
      'access-control-allow-credentials': 'true',
    },
    body: Buffer.from(await response.arrayBuffer()),
  });
}

export class MockApi {
  constructor(private readonly page: Page) {}

  /**
   * Auth service stubs. Accept `admin` / `secret`, reject anything else with
   * 400; refresh, logout and change-password succeed.
   */
  async login(): Promise<void> {
    await this.page.route(authUrl(endpoints.auth.login), async (route) => {
      const body = route.request().postDataJSON() as {
        username?: string;
        password?: string;
      };
      if (body.username === 'admin' && body.password === 'secret') {
        await route.fulfill({
          json: {
            /* The real auth service sends only these three fields; the user,
               tenant and roles live inside the access token. */
            access: makeJwt(),
            refresh: 'refresh-token',
            permissions: DEFAULT_PERMISSIONS,
          },
        });
        return;
      }
      await route.fulfill({
        status: 400,
        json: {
          non_field_errors: [
            'No active account found with the given credentials',
          ],
        },
      });
    });

    await this.page.route(authUrl(endpoints.auth.refresh), (route) =>
      route.fulfill({
        status: 200,
        json: { access: makeJwt(), refresh: 'refresh-token' },
      }),
    );
    await this.page.route(authUrl(endpoints.auth.logout), (route) =>
      route.fulfill({ status: 200, json: {} }),
    );
    await this.page.route(authUrl(endpoints.auth.changePassword), (route) =>
      route.fulfill({ status: 200, json: {} }),
    );
  }

  /**
   * Default stubs for the app shell (workspace name, current user, notifications). Call in
   * `beforeEach` before navigating to any dashboard route.
   */
  async shell(): Promise<void> {
    await this.json('**/api/workspace*', {
      name: 'الشركة التجريبية',
      code: 'DEMO-01',
    });
    await this.json('**/api/directory/resolve', []);
    await this.json('**/api/directory/search*', []);
    await this.json('**/me', {
      userId: 'user-1',
      tenantId: 'tenant-1',
      username: 'admin',
      displayName: 'Ali Karkhi',
      firstName: 'Ali',
      lastName: 'Karkhi',
      jobTitle: 'Storekeeper',
      orgUnitName: 'Baghdad branch',
      avatarUrl: null,
      roles: ['ADMIN'],
      permissions: DEFAULT_PERMISSIONS,
      scopes: {},
    });
    await this.json('**/api/notifications*', {
      unreadCount: 0,
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
  }

  /**
   * The demo backend from src/mocks (the same MSW handlers the browser demo
   * and the unit tests use) behind every API and auth request, starting from
   * the seed data. Call it first: routes registered after it (login(),
   * json(), a spec's own page.route) take precedence over it.
   */
  async backend(): Promise<void> {
    resetMockDb();
    await this.page.route(`${API_BASE_URL}/**`, fulfillFromMocks);
    await this.page.route(`${AUTH_BASE_URL}/**`, fulfillFromMocks);
  }

  /** Generic JSON stub for any other endpoint. */
  async json(urlGlob: string, body: unknown, status = 200): Promise<void> {
    await this.page.route(urlGlob, (route) =>
      route.fulfill({ status, json: body }),
    );
  }
}

export const test = base.extend<AppOptions & AppFixtures>({
  language: ['ar', { option: true }],
  theme: ['light', { option: true }],

  context: async ({ context, language, theme, baseURL }, use) => {
    await context.addCookies([
      { name: 'lng', value: language, url: baseURL ?? 'http://localhost:3100' },
    ]);
    await context.addInitScript((value: Theme) => {
      window.localStorage.setItem('app-theme', value);
    }, theme);
    await use(context);
  },

  mockApi: async ({ page }, use) => {
    await use(new MockApi(page));
  },

  dir: async ({ language }, use) => {
    await use(language === 'ar' ? 'rtl' : 'ltr');
  },
});

export { expect };

/** Sign in through the real login form (backend mocked). */
export async function loginAs(page: Page, mockApi: MockApi): Promise<void> {
  await mockApi.login();
  await page.goto('/login');
  await page.getByLabel(/^(username|اسم المستخدم)\s*\*?$/i).fill('admin');
  await page.getByLabel(/^(password|كلمة المرور)\s*\*?$/i).fill('secret');
  await page.getByRole('button', { name: /sign in|تسجيل الدخول/i }).click();
  await expect(page).toHaveURL(/\/$/);
}
