import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS, type Permission } from '@/constants/permissions';
import { supplierHandlers } from '@/mocks/handlers/suppliers';
import { resetMockDb } from '@/mocks/seed/base';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { screen, waitFor, within } from '@/test/render';
import { renderApp } from '@/test/render-app';

const ALL: Permission[] = [
  PERMS.supplier.view,
  PERMS.supplier.create,
  PERMS.supplier.update,
  PERMS.supplier.delete,
];
const WAIT = { timeout: 5000 };

/** Every supplier request the page sends, as `METHOD path?query`. */
let requests: string[] = [];
function onRequest({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/suppliers')) {
    requests.push(
      `${request.method} ${url.pathname}${decodeURIComponent(url.search)}`,
    );
  }
}

async function openList(url = '/suppliers', permissions = ALL) {
  signIn({ roles: [], permissions });
  const view = await renderApp(url);
  await screen.findByRole(
    'heading',
    { level: 1, name: tt('suppliers.title') },
    WAIT,
  );
  return view;
}

function table() {
  return screen.getByRole('table', { name: tt('suppliers.caption') });
}

describe('suppliers list (real route, shared mock backend)', () => {
  beforeEach(() => {
    resetMockDb();
    requests = [];
    // The same handlers the browser demo and the Playwright suite use.
    server.use(...supplierHandlers);
    server.events.on('request:start', onRequest);
  });

  afterEach(() => {
    server.events.removeListener('request:start', onRequest);
  });

  it('shows the first server page and pages through the URL', async () => {
    const { user, router } = await openList();
    expect(await within(table()).findByText('SUP-001', {}, WAIT)).toBeVisible();
    expect(within(table()).queryByText('SUP-011')).toBeNull();
    expect(requests[0]).toBe('GET /api/suppliers?page=0&size=10');

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(await within(table()).findByText('SUP-011', {}, WAIT)).toBeVisible();
    expect(router.state.location.search).toMatchObject({ page: 2 });
    expect(requests).toContain('GET /api/suppliers?page=1&size=10');
  });

  it('sorts on the server when a header is clicked', async () => {
    const { user, router } = await openList();
    await within(table()).findByText('SUP-001', {}, WAIT);
    const header = screen.getByRole('columnheader', {
      name: new RegExp(tt('suppliers.columns.code')),
    });
    expect(header).toHaveAttribute('aria-sort', 'none');

    await user.click(within(header).getByRole('button'));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ sort: 'code.asc' });
    });
    await user.click(within(header).getByRole('button'));
    expect(await within(table()).findByText('SUP-025', {}, WAIT)).toBeVisible();
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(requests.at(-1)).toBe(
      'GET /api/suppliers?page=0&size=10&sort=code,desc',
    );
  });

  it('reads filters from a shared link and clears them', async () => {
    const { user, router } = await openList('/suppliers?status=inactive&q=zzz');
    expect(
      await screen.findByText(tt('suppliers.emptyFiltered'), {}, WAIT),
    ).toBeVisible();
    expect(requests[0]).toBe(
      'GET /api/suppliers?page=0&size=10&q=zzz&isActive=false',
    );

    const clear = within(table()).getByRole('button', {
      name: tt('table.clearFilters'),
    });
    await user.click(clear);
    expect(await within(table()).findByText('SUP-001', {}, WAIT)).toBeVisible();
    expect(router.state.location.search).toEqual({});
  });

  it('commits the search text once typing pauses', async () => {
    const { user, router } = await openList();
    await within(table()).findByText('SUP-001', {}, WAIT);
    await user.type(
      screen.getByRole('searchbox', { name: tt('common.search') }),
      'SUP-003',
    );
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: 'SUP-003' });
    }, WAIT);
    expect(await within(table()).findByText('SUP-003')).toBeVisible();
    expect(requests.filter((line) => line.includes('q=SUP'))).toEqual([
      'GET /api/suppliers?page=0&size=10&q=SUP-003',
    ]);
  });

  it('shows the error row and retries', async () => {
    let calls = 0;
    server.use(
      http.get(api(endpoints.suppliers.list), () => {
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
    expect(await within(table()).findByText('SUP-001', {}, WAIT)).toBeVisible();
  });

  it('deletes after a confirm that starts on Cancel', async () => {
    const { user } = await openList('/suppliers?q=SUP-013');
    const row = (await within(table()).findByText('SUP-013', {}, WAIT)).closest(
      'tr',
    );
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
      await screen.findByText(tt('suppliers.emptyFiltered'), {}, WAIT),
    ).toBeVisible();
    expect(requests.filter((line) => line.startsWith('DELETE'))).toHaveLength(
      1,
    );
  });

  it('refuses to delete a supplier on documents without a request', async () => {
    const { user } = await openList('/suppliers?q=SUP-001');
    await within(table()).findByText('SUP-001', {}, WAIT);
    const name = screen.getAllByRole('button', { name: /^Delete / })[0];
    if (!name) {
      throw new Error('delete action missing');
    }
    expect(name).toHaveAttribute('aria-disabled', 'true');
    expect(name).toHaveAccessibleDescription(
      tt('suppliers.actions.deleteBlocked'),
    );
    await user.click(name);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(requests.some((line) => line.startsWith('DELETE'))).toBe(false);
  });

  it('hides actions the user may not use', async () => {
    await openList('/suppliers', [PERMS.supplier.view]);
    await within(table()).findByText('SUP-001', {}, WAIT);
    expect(screen.queryByRole('button', { name: /^Delete / })).toBeNull();
    expect(
      screen.queryByRole('button', { name: tt('suppliers.create') }),
    ).toBeNull();
  });

  it('puts a backend field error under the input', async () => {
    const { user } = await openList();
    await within(table()).findByText('SUP-001', {}, WAIT);
    await user.click(
      screen.getByRole('button', { name: tt('suppliers.create') }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Code/), 'SUP-001');
    await user.type(within(dialog).getByLabelText(/^Name/), 'Copy');
    await user.click(
      within(dialog).getByRole('button', { name: tt('suppliers.dialog.save') }),
    );
    expect(
      // The mock answers in the request's Accept-Language.
      await within(dialog).findByText(
        /Supplier code already exists|رمز المورد مستخدم مسبقاً/,
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
    const { user } = await openList('/suppliers?q=SUP-002');
    await within(table()).findByText('SUP-002', {}, WAIT);
    await user.click(
      screen.getAllByRole('button', { name: /^Edit / })[0] ?? table(),
    );
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByLabelText(/^Code/)).toHaveValue('SUP-002');
    }, WAIT);
    expect(
      requests.some((line) => /^GET \/api\/suppliers\/[\w-]+$/.test(line)),
    ).toBe(true);
  });
});
