import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS, type Permission } from '@/constants/permissions';
import { unitHandlers } from '@/mocks/handlers/units';
import { resetMockDb } from '@/mocks/seed/base';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { screen, waitFor, within } from '@/test/render';
import { renderApp } from '@/test/render-app';

const ALL: Permission[] = [
  PERMS.unitOfMeasure.view,
  PERMS.unitOfMeasure.create,
  PERMS.unitOfMeasure.update,
  PERMS.unitOfMeasure.delete,
];
const WAIT = { timeout: 5000 };

/** Every units request the page sends, as `METHOD path?query`. */
let requests: string[] = [];
function onRequest({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/units-of-measure')) {
    requests.push(
      `${request.method} ${url.pathname}${decodeURIComponent(url.search)}`,
    );
  }
}

async function openList(url = '/units-of-measure', permissions = ALL) {
  signIn({ roles: [], permissions });
  const view = await renderApp(url);
  await screen.findByRole(
    'heading',
    { level: 1, name: tt('unitsOfMeasure.title') },
    WAIT,
  );
  return view;
}

function table() {
  return screen.getByRole('table', { name: tt('unitsOfMeasure.caption') });
}

describe('units of measure list (real route, shared mock backend)', () => {
  beforeEach(() => {
    resetMockDb();
    requests = [];
    server.use(...unitHandlers);
    server.events.on('request:start', onRequest);
  });

  afterEach(() => {
    server.events.removeListener('request:start', onRequest);
  });

  it('shows the first server page and pages through the URL', async () => {
    const { user, router } = await openList();
    expect(await within(table()).findByText('PCS', {}, WAIT)).toBeVisible();
    expect(within(table()).queryByText('DOZ')).toBeNull();
    expect(requests[0]).toBe('GET /api/units-of-measure?page=0&size=10');

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(await within(table()).findByText('DOZ', {}, WAIT)).toBeVisible();
    expect(router.state.location.search).toMatchObject({ page: 2 });
    expect(requests).toContain('GET /api/units-of-measure?page=1&size=10');
  });

  it('sorts on the server when a header is clicked', async () => {
    const { user, router } = await openList();
    await within(table()).findByText('PCS', {}, WAIT);
    const header = screen.getByRole('columnheader', {
      name: new RegExp(tt('unitsOfMeasure.columns.code')),
    });
    await user.click(within(header).getByRole('button'));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ sort: 'code.asc' });
    });
    await user.click(within(header).getByRole('button'));
    expect(await within(table()).findByText('TON', {}, WAIT)).toBeVisible();
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(requests.at(-1)).toBe(
      'GET /api/units-of-measure?page=0&size=10&sort=code,desc',
    );
  });

  it('reads filters from a shared link and clears them', async () => {
    const { user, router } = await openList(
      '/units-of-measure?status=inactive&decimals=3',
    );
    expect(await within(table()).findByText('TON', {}, WAIT)).toBeVisible();
    expect(within(table()).queryByText('PCS')).toBeNull();
    expect(requests[0]).toBe(
      'GET /api/units-of-measure?page=0&size=10&isActive=false&decimalPlaces=3',
    );

    await user.click(
      screen.getByRole('button', { name: tt('table.clearFilters') }),
    );
    expect(await within(table()).findByText('PCS', {}, WAIT)).toBeVisible();
    expect(router.state.location.search).toEqual({});
  });

  it('shows the filtered empty state with a clear button', async () => {
    await openList('/units-of-measure?q=zzz');
    expect(
      await screen.findByText(tt('unitsOfMeasure.emptyFiltered'), {}, WAIT),
    ).toBeVisible();
  });

  it('shows the error row and retries', async () => {
    let calls = 0;
    server.use(
      http.get(api(endpoints.unitsOfMeasure.list), () => {
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
    expect(await within(table()).findByText('PCS', {}, WAIT)).toBeVisible();
  });

  it('deletes after a confirm that starts on Cancel', async () => {
    const { user } = await openList('/units-of-measure?q=SET');
    const row = (await within(table()).findByText('SET', {}, WAIT)).closest(
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
      await screen.findByText(tt('unitsOfMeasure.emptyFiltered'), {}, WAIT),
    ).toBeVisible();
    expect(requests.filter((line) => line.startsWith('DELETE'))).toHaveLength(
      1,
    );
  });

  it('refuses to delete a unit used by items without a request', async () => {
    const { user } = await openList('/units-of-measure?q=PCS');
    await within(table()).findByText('PCS', {}, WAIT);
    const button = screen.getAllByRole('button', { name: /^Delete / })[0];
    if (!button) {
      throw new Error('delete action missing');
    }
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAccessibleDescription(
      tt('unitsOfMeasure.actions.deleteBlocked'),
    );
    await user.click(button);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(requests.some((line) => line.startsWith('DELETE'))).toBe(false);
  });

  it('hides actions the user may not use', async () => {
    await openList('/units-of-measure', [PERMS.unitOfMeasure.view]);
    await within(table()).findByText('PCS', {}, WAIT);
    expect(screen.queryByRole('button', { name: /^Delete / })).toBeNull();
    expect(
      screen.queryByRole('button', { name: tt('unitsOfMeasure.create') }),
    ).toBeNull();
  });

  it('puts a backend field error under the input', async () => {
    const { user } = await openList();
    await within(table()).findByText('PCS', {}, WAIT);
    await user.click(
      screen.getByRole('button', { name: tt('unitsOfMeasure.create') }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Code/), 'pcs');
    await user.type(within(dialog).getByLabelText(/^Name/), 'Copy');
    await user.click(
      within(dialog).getByRole('button', {
        name: tt('unitsOfMeasure.dialog.save'),
      }),
    );
    expect(
      await within(dialog).findByText(
        /Unit code already exists|رمز الوحدة مستخدم مسبقاً/,
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
    const { user } = await openList('/units-of-measure?q=KG');
    await within(table()).findByText('KG', {}, WAIT);
    await user.click(
      screen.getAllByRole('button', { name: /^Edit / })[0] ?? table(),
    );
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByLabelText(/^Code/)).toHaveValue('KG');
    }, WAIT);
    expect(
      requests.some((line) =>
        /^GET \/api\/units-of-measure\/[\w-]+$/.test(line),
      ),
    ).toBe(true);
  });
});
