import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PERMS, type Permission } from '@/constants/permissions';
import { overviewHandlers } from '@/mocks/handlers/overview';
import { resetMockDb } from '@/mocks/seed/base';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { server } from '@/test/msw/server';
import { screen, waitFor, within } from '@/test/render';
import { renderApp } from '@/test/render-app';

const WAIT = { timeout: 5000 };
const RESOURCES = ['warehouse', 'supplier', 'category', 'unit'] as const;

/** Every overview request the page sends, as `path`. */
let requests: string[] = [];
function onRequest({ request }: { request: Request }) {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith('/api/overview')) {
    requests.push(pathname);
  }
}

async function openHome(permissions: Permission[], roles: string[] = []) {
  signIn({ roles, permissions });
  await renderApp('/');
  await screen.findByRole(
    'heading',
    { level: 1, name: /Good (morning|evening)/ },
    WAIT,
  );
}

function kpiLink(href: string) {
  return document.querySelector(`a[href="${href}"]`);
}

describe('home page permissions (real route, shared mock backend)', () => {
  beforeEach(() => {
    resetMockDb();
    requests = [];
    server.use(...overviewHandlers);
    server.events.on('request:start', onRequest);
  });

  afterEach(() => {
    server.events.removeListener('request:start', onRequest);
  });

  it('shows every card, the chart and every kind of change to a superadmin', async () => {
    await openHome([], ['SUPERADMIN']);

    expect(
      await screen.findByRole('link', { name: /Suppliers/ }, WAIT),
    ).toBeVisible();
    for (const href of [
      '/warehouses',
      '/suppliers',
      '/categories',
      '/units-of-measure',
    ]) {
      expect(kpiLink(href)).not.toBeNull();
    }
    expect(
      await screen.findByRole('img', { name: tt('home.activity.title') }, WAIT),
    ).toBeVisible();
    const table = await screen.findByRole(
      'table',
      { name: tt('home.recent.title') },
      WAIT,
    );
    for (const resource of RESOURCES) {
      expect(
        within(table).getAllByText(tt(`home.recent.resource.${resource}`))
          .length,
      ).toBeGreaterThan(0);
    }
  });

  it('shows a supplier-only user nothing about warehouses, categories or units', async () => {
    await openHome([PERMS.supplier.view]);

    const table = await screen.findByRole(
      'table',
      { name: tt('home.recent.title') },
      WAIT,
    );
    expect(
      await screen.findByRole('link', { name: /Suppliers/ }, WAIT),
    ).toBeVisible();
    expect(kpiLink('/warehouses')).toBeNull();
    expect(kpiLink('/categories')).toBeNull();
    expect(kpiLink('/units-of-measure')).toBeNull();

    // Recent changes: only supplier rows, and no link to a page that would 403.
    expect(
      within(table).getAllByText(tt('home.recent.resource.supplier')).length,
    ).toBeGreaterThan(0);
    for (const resource of ['warehouse', 'category', 'unit'] as const) {
      expect(
        within(table).queryByText(tt(`home.recent.resource.${resource}`)),
      ).toBeNull();
    }
    const hrefs = within(table)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(new Set(hrefs)).toEqual(new Set(['/suppliers']));

    // The chart counts every kind of change, so it needs every permission.
    expect(
      screen.queryByRole('img', { name: tt('home.activity.title') }),
    ).toBeNull();
    expect(requests).not.toContain('/api/overview/activity');
  });

  it('says there is nothing to show, and asks for nothing, with no read permission', async () => {
    await openHome([PERMS.supplier.create]);

    expect(
      await screen.findByText(tt('home.noAccess'), {}, WAIT),
    ).toBeVisible();
    expect(kpiLink('/suppliers')).toBeNull();
    expect(
      screen.queryByRole('table', { name: tt('home.recent.title') }),
    ).toBeNull();
    await waitFor(() => {
      expect(requests).toEqual([]);
    });
  });
});
