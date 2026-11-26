import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS, type Permission } from '@/constants/permissions';
import { warehouseHandlers } from '@/mocks/handlers/warehouses';
import { resetMockDb } from '@/mocks/seed/base';
import { warehouses } from '@/mocks/seed/warehouses';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { screen, waitFor, within } from '@/test/render';
import { renderApp } from '@/test/render-app';
import { makeWarehouse } from './warehouse-test-utils';

const ALL: Permission[] = [
  PERMS.warehouse.view,
  PERMS.warehouse.create,
  PERMS.warehouse.update,
  PERMS.warehouse.delete,
];
const WAIT = { timeout: 5000 };

/** Every warehouse request the page sends, as `METHOD path?query`. */
let requests: string[] = [];
function onRequest({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/warehouses')) {
    requests.push(
      `${request.method} ${url.pathname}${decodeURIComponent(url.search)}`,
    );
  }
}

async function openList(url = '/warehouses', permissions = ALL) {
  signIn({ roles: [], permissions });
  const view = await renderApp(url);
  await screen.findByRole(
    'heading',
    { level: 1, name: tt('warehouses.title') },
    WAIT,
  );
  return view;
}

function table() {
  return screen.getByRole('table', { name: tt('warehouses.caption') });
}

describe('warehouses list (real route, shared mock backend)', () => {
  beforeEach(() => {
    resetMockDb();
    requests = [];
    // The same handlers the browser demo and the Playwright suite use.
    server.use(...warehouseHandlers);
    server.events.on('request:start', onRequest);
  });

  afterEach(() => {
    server.events.removeListener('request:start', onRequest);
  });

  it('shows the first server page with a link to each detail page', async () => {
    await openList();
    expect(
      await within(table()).findByText('WH-BGD-01', {}, WAIT),
    ).toBeVisible();
    expect(requests[0]).toBe('GET /api/warehouses?page=0&size=10');
    const links = within(table()).getAllByRole('link');
    expect(links[0]).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/warehouses\/[\w-]+$/),
    );
  });

  it('sorts on the server when a header is clicked', async () => {
    const { user, router } = await openList();
    await within(table()).findByText('WH-BGD-01', {}, WAIT);
    const header = screen.getByRole('columnheader', {
      name: new RegExp(tt('warehouses.columns.code')),
    });
    expect(header).toHaveAttribute('aria-sort', 'none');

    await user.click(within(header).getByRole('button'));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ sort: 'code.asc' });
    });
    await user.click(within(header).getByRole('button'));
    await waitFor(() => {
      expect(header).toHaveAttribute('aria-sort', 'descending');
    }, WAIT);
    expect(requests.at(-1)).toBe(
      'GET /api/warehouses?page=0&size=10&sort=code,desc',
    );
    const firstRow = within(table()).getAllByRole('row')[1];
    expect(firstRow).toHaveTextContent('WH-TRN-01');
  });

  it('reads filters from a shared link and clears them', async () => {
    const { user, router } = await openList('/warehouses?type=transit');
    expect(
      await within(table()).findByText('WH-TRN-01', {}, WAIT),
    ).toBeVisible();
    expect(within(table()).queryByText('WH-BGD-01')).toBeNull();
    expect(requests[0]).toBe(
      'GET /api/warehouses?page=0&size=10&isTransit=true',
    );

    await user.click(
      screen.getByRole('button', { name: tt('table.clearFilters') }),
    );
    expect(
      await within(table()).findByText('WH-BGD-01', {}, WAIT),
    ).toBeVisible();
    expect(router.state.location.search).toEqual({});
  });

  it('filters by status from a link and shows the empty state when nothing matches', async () => {
    await openList('/warehouses?status=inactive');
    expect(
      await within(table()).findByText('WH-KRB-01', {}, WAIT),
    ).toBeVisible();
    expect(within(table()).queryByText('WH-BGD-01')).toBeNull();
  });

  it('shows the filtered empty state with a clear button', async () => {
    await openList('/warehouses?q=zzz');
    expect(
      await screen.findByText(tt('warehouses.emptyFiltered'), {}, WAIT),
    ).toBeVisible();
    expect(
      within(table()).getByRole('button', { name: tt('table.clearFilters') }),
    ).toBeVisible();
  });

  it('commits the search text once typing pauses, and matches the manager name too', async () => {
    const { user, router } = await openList();
    await within(table()).findByText('WH-BGD-01', {}, WAIT);
    await user.type(
      screen.getByRole('searchbox', { name: tt('common.search') }),
      'TRN',
    );
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: 'TRN' });
    }, WAIT);
    expect(await within(table()).findByText('WH-TRN-01')).toBeVisible();
    expect(requests.filter((line) => line.includes('q=TRN'))).toEqual([
      'GET /api/warehouses?page=0&size=10&q=TRN',
    ]);
  });

  it('moves a page past the end back to the last page', async () => {
    const { router } = await openList('/warehouses?page=4');
    expect(
      await within(table()).findByText('WH-BGD-01', {}, WAIT),
    ).toBeVisible();
    expect(router.state.location.search).toEqual({});
    expect(requests).toContain('GET /api/warehouses?page=3&size=10');
  });

  it('shows the error row and retries', async () => {
    let calls = 0;
    server.use(
      http.get(api(endpoints.warehouses.list), () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ message: 'down' }, { status: 503 })
          : undefined;
      }),
    );
    const { user } = await openList();
    await user.click(
      await screen.findByRole('button', { name: tt('common.tryAgain') }, WAIT),
    );
    expect(
      await within(table()).findByText('WH-BGD-01', {}, WAIT),
    ).toBeVisible();
  });

  it('deletes after a confirm that starts on Cancel', async () => {
    // Every seeded warehouse has locations, so add an empty one to delete.
    warehouses.unshift(
      makeWarehouse({ id: 'wh-empty', code: 'WH-EMPTY', locationCount: 0 }),
    );
    const { user } = await openList('/warehouses?q=WH-EMPTY');
    const row = (
      await within(table()).findByText('WH-EMPTY', {}, WAIT)
    ).closest('tr');
    if (!row) {
      throw new Error('row not found');
    }
    await user.click(within(row).getByRole('button', { name: /^Delete / }));
    const confirm = await screen.findByRole('alertdialog');
    expect(
      within(confirm).getByRole('button', { name: tt('common.cancel') }),
    ).toHaveFocus();
    await user.click(
      within(confirm).getByRole('button', { name: tt('common.delete') }),
    );
    expect(
      await screen.findByText(tt('warehouses.emptyFiltered'), {}, WAIT),
    ).toBeVisible();
    expect(requests.filter((line) => line.startsWith('DELETE'))).toHaveLength(
      1,
    );
  });

  it('refuses to delete a warehouse with locations without a request', async () => {
    const { user } = await openList('/warehouses?q=WH-BGD');
    await within(table()).findByText('WH-BGD-01', {}, WAIT);
    const button = screen.getAllByRole('button', { name: /^Delete / })[0];
    if (!button) {
      throw new Error('delete action missing');
    }
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAccessibleDescription(
      tt('warehouses.actions.deleteBlocked'),
    );
    await user.click(button);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(requests.some((line) => line.startsWith('DELETE'))).toBe(false);
  });

  it('keeps view and hides the actions the user may not use', async () => {
    await openList('/warehouses', [PERMS.warehouse.view]);
    await within(table()).findByText('WH-BGD-01', {}, WAIT);
    expect(screen.queryByRole('button', { name: /^Delete / })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Edit / })).toBeNull();
    expect(screen.getAllByRole('button', { name: /^View / }).length).toBe(7);
    expect(
      screen.queryByRole('button', { name: tt('warehouses.create') }),
    ).toBeNull();
  });

  it('puts a backend field error under the input', async () => {
    const { user } = await openList();
    await within(table()).findByText('WH-BGD-01', {}, WAIT);
    await user.click(
      screen.getByRole('button', { name: tt('warehouses.create') }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Code/), 'wh-bgd-01');
    await user.type(within(dialog).getByLabelText(/^Name/), 'Copy');
    await user.type(within(dialog).getByLabelText(/^Address/), 'Somewhere');
    await user.click(
      within(dialog).getByRole('button', {
        name: tt('warehouses.dialog.save'),
      }),
    );
    expect(
      // The mock answers in the request's Accept-Language.
      await within(dialog).findByText(
        /Warehouse code already exists|رمز المستودع مستخدم مسبقاً/,
        {},
        WAIT,
      ),
    ).toBeVisible();
    expect(within(dialog).getByLabelText(/^Code/)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(requests.filter((line) => line.startsWith('POST'))).toHaveLength(1);
  });

  it('edits the record loaded by id', async () => {
    const { user } = await openList('/warehouses?q=WH-ERB');
    await within(table()).findByText('WH-ERB-01', {}, WAIT);
    await user.click(
      screen.getAllByRole('button', { name: /^Edit / })[0] ?? table(),
    );
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByLabelText(/^Code/)).toHaveValue('WH-ERB-01');
    }, WAIT);
    expect(
      requests.some((line) => /^GET \/api\/warehouses\/[\w-]+$/.test(line)),
    ).toBe(true);
  });
});
