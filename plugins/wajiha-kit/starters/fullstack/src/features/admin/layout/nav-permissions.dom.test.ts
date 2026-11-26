import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { createSiteI18n } from '@/features/site/i18n/resources';
import { routeTree } from '@/routeTree.gen';
import { ALL_PERMISSIONS, PERMS, SUPER_ROLE } from '../constants/permissions';
import { getAdminQueryClient } from '../lib/query-client';
import { isGranted } from '../store/permission-store';
import { startSession } from '../store/session';
import { ADMIN_NAV } from './nav-config';

// The page-to-permission binding is written in two places that must agree: the route guard
// (requirePermission in the route file) and the nav item (permission in nav-config.ts). Nothing but this
// test connects them, so it runs the REAL route tree: for every menu entry and every kind of user, the
// menu shows the entry exactly when the route lets that user in.

type Grants = { label: string; roles: string[]; permissions: string[] };

const USERS: Grants[] = [
  { label: 'a user with no rights', roles: [], permissions: [] },
  { label: 'an administrator', roles: [SUPER_ROLE], permissions: [] },
  ...ALL_PERMISSIONS.map((permission) => ({
    label: `a user with only ${permission}`,
    roles: [],
    permissions: [permission],
  })),
  { label: 'a user with every permission', roles: [], permissions: [...ALL_PERMISSIONS] },
];

/** Where the real route tree sends a signed-in user who opens this admin page. */
async function landingPath(to: string, user: Grants): Promise<string> {
  startSession({
    accessToken: 'mock-token-admin-nav',
    user: { id: 'u1', username: 'demo', name: 'Demo' },
    roles: user.roles,
    permissions: user.permissions,
  });
  const path = to.replace('$locale', 'en');
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { i18n: createSiteI18n('en') },
  });
  await router.load();
  return router.state.location.pathname;
}

afterEach(() => {
  getAdminQueryClient().clear();
});

describe('permission names', () => {
  it('are <resource>:<action> strings that ALL_PERMISSIONS lists once each', () => {
    for (const [group, actions] of Object.entries(PERMS)) {
      for (const [action, permission] of Object.entries(actions)) {
        expect(permission).toBe(`${group}:${action}`);
      }
    }
    expect(new Set(ALL_PERMISSIONS).size).toBe(ALL_PERMISSIONS.length);
  });

  it('are the only permissions a menu entry may ask for', () => {
    for (const item of ADMIN_NAV) {
      if (item.permission !== undefined) {
        expect(ALL_PERMISSIONS).toContain(item.permission);
      }
    }
  });
});

describe('menu and route guard agree', () => {
  for (const item of ADMIN_NAV) {
    describe(item.to, () => {
      for (const user of USERS) {
        it(`${user.label}: the menu shows the entry exactly when the route lets them in`, async () => {
          const shown = item.permission === undefined || isGrantedFor(user, item.permission);
          const landed = await landingPath(item.to, user);
          const expected = item.to.replace('$locale', 'en');
          expect(landed === expected, `landed on ${landed}`).toBe(shown);
          if (!shown) {
            expect(landed).toBe('/en/admin/forbidden');
          }
        });
      }
    });
  }

  it('lets a signed-out visitor into no menu entry', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/en/admin/suppliers'] }),
      context: { i18n: createSiteI18n('en') },
    });
    await router.load();
    expect(router.state.location.pathname).toBe('/en/admin/login');
    expect(router.state.location.search).toMatchObject({ redirect: '/en/admin/suppliers' });
  });
});

function isGrantedFor(user: Grants, permission: (typeof ALL_PERMISSIONS)[number]): boolean {
  return isGranted({ roles: user.roles, permissions: user.permissions }, permission);
}
