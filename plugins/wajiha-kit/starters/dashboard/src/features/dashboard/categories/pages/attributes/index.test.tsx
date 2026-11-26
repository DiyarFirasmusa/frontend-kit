import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS, type Permission } from '@/constants/permissions';
import { attributeHandlers } from '@/mocks/handlers/attributes';
import { categoryHandlers } from '@/mocks/handlers/categories';
import { resetMockDb } from '@/mocks/seed/base';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { screen, waitFor, within } from '@/test/render';
import { renderApp } from '@/test/render-app';

const ALL: Permission[] = [
  PERMS.attributeDefinition.view,
  PERMS.attributeDefinition.create,
  PERMS.attributeDefinition.update,
  PERMS.attributeDefinition.delete,
];
const WAIT = { timeout: 5000 };

/** Every attribute request the page sends, as `METHOD path?query`. */
let requests: string[] = [];
function onRequest({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/attribute-definitions')) {
    requests.push(
      `${request.method} ${url.pathname}${decodeURIComponent(url.search)}`,
    );
  }
}

async function openList(url = '/attributes', permissions = ALL) {
  signIn({ roles: [], permissions });
  const view = await renderApp(url);
  await screen.findByRole(
    'heading',
    { level: 1, name: tt('categories.attributes.title') },
    WAIT,
  );
  return view;
}

function table() {
  return screen.getByRole('table', {
    name: tt('categories.attributes.caption'),
  });
}

describe('attributes list (real route, shared mock backend)', () => {
  beforeEach(() => {
    resetMockDb();
    requests = [];
    server.use(...attributeHandlers, ...categoryHandlers);
    server.events.on('request:start', onRequest);
  });

  afterEach(() => {
    server.events.removeListener('request:start', onRequest);
  });

  it('shows the first server page and pages through the URL', async () => {
    const { user, router } = await openList();
    expect(await within(table()).findByText('COLOR', {}, WAIT)).toBeVisible();
    expect(within(table()).queryByText('BRAND')).toBeNull();
    expect(requests[0]).toBe('GET /api/attribute-definitions?page=0&size=10');

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(await within(table()).findByText('BRAND', {}, WAIT)).toBeVisible();
    expect(router.state.location.search).toMatchObject({ page: 2 });
    expect(requests).toContain('GET /api/attribute-definitions?page=1&size=10');
  });

  it('sorts on the server when a header is clicked', async () => {
    const { user, router } = await openList();
    await within(table()).findByText('COLOR', {}, WAIT);
    const header = screen.getByRole('columnheader', {
      name: new RegExp(tt('categories.attributes.col.code')),
    });
    await user.click(within(header).getByRole('button'));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ sort: 'code.asc' });
    });
    await user.click(within(header).getByRole('button'));
    expect(await within(table()).findByText('WEIGHT', {}, WAIT)).toBeVisible();
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(requests.at(-1)).toBe(
      'GET /api/attribute-definitions?page=0&size=10&sort=code,desc',
    );
  });

  it('reads filters from a shared link and clears them', async () => {
    const { user, router } = await openList(
      '/attributes?status=inactive&dataType=NUMBER',
    );
    expect(
      await within(table()).findByText('CAPACITY_OLD', {}, WAIT),
    ).toBeVisible();
    expect(within(table()).queryByText('WEIGHT')).toBeNull();
    expect(requests[0]).toBe(
      'GET /api/attribute-definitions?page=0&size=10&dataType=NUMBER&isActive=false',
    );
    await user.click(
      screen.getByRole('button', { name: tt('table.clearFilters') }),
    );
    expect(await within(table()).findByText('COLOR', {}, WAIT)).toBeVisible();
    expect(router.state.location.search).toEqual({});
  });

  it('shows the filtered empty state', async () => {
    await openList('/attributes?q=zzz');
    expect(
      await screen.findByText(
        tt('categories.attributes.emptyFiltered'),
        {},
        WAIT,
      ),
    ).toBeVisible();
  });

  it('shows the error row and retries', async () => {
    let calls = 0;
    server.use(
      http.get(api(endpoints.attributeDefinitions.list), () => {
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
    expect(await within(table()).findByText('COLOR', {}, WAIT)).toBeVisible();
  });

  it('deletes after a confirm that starts on Cancel', async () => {
    const { user } = await openList('/attributes?q=CAPACITY');
    const row = (
      await within(table()).findByText('CAPACITY_OLD', {}, WAIT)
    ).closest('tr');
    if (!row) {
      throw new Error('row not found');
    }
    await user.click(within(row).getByRole('button', { name: /^Delete / }));
    const confirm = await screen.findByRole('alertdialog');
    await waitFor(() => {
      expect(
        within(confirm).getByRole('button', { name: tt('common.cancel') }),
      ).toHaveFocus();
    });
    await user.click(
      within(confirm).getByRole('button', { name: tt('common.delete') }),
    );
    expect(
      await screen.findByText(
        tt('categories.attributes.emptyFiltered'),
        {},
        WAIT,
      ),
    ).toBeVisible();
    expect(requests.filter((line) => line.startsWith('DELETE'))).toHaveLength(
      1,
    );
  });

  it('hides actions the user may not use', async () => {
    await openList('/attributes', [PERMS.attributeDefinition.view]);
    await within(table()).findByText('COLOR', {}, WAIT);
    expect(screen.queryByRole('button', { name: /^Delete / })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Edit / })).toBeNull();
    expect(
      screen.queryByRole('button', {
        name: tt('categories.actions.addAttribute'),
      }),
    ).toBeNull();
  });

  it('puts a backend field error under the input', async () => {
    const { user } = await openList();
    await within(table()).findByText('COLOR', {}, WAIT);
    await user.click(
      screen.getByRole('button', {
        name: tt('categories.actions.addAttribute'),
      }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Attribute name/), 'اللون');
    await user.click(
      within(dialog).getByRole('button', {
        name: tt('categories.attributeForm.submit'),
      }),
    );
    expect(
      await within(dialog).findByText(
        /Attribute name already exists|اسم الخاصية مستخدم مسبقاً/,
        {},
        WAIT,
      ),
    ).toBeVisible();
    expect(within(dialog).getByLabelText(/^Attribute name/)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(requests.filter((line) => line.startsWith('POST'))).toHaveLength(1);
  });

  it('edits the record loaded by id', async () => {
    const { user } = await openList('/attributes?q=WATERPROOF');
    await within(table()).findByText('WATERPROOF', {}, WAIT);
    await user.click(
      screen.getAllByRole('button', { name: /^Edit (?!options)/ })[0] ??
        table(),
    );
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByLabelText(/^Attribute code/)).toHaveValue(
        'WATERPROOF',
      );
    }, WAIT);
    expect(
      requests.some((line) =>
        /^GET \/api\/attribute-definitions\/[\w-]+$/.test(line),
      ),
    ).toBe(true);
  });

  it('opens the options editor for an OPTION attribute only', async () => {
    const { user } = await openList('/attributes?q=COLOR');
    await within(table()).findByText('COLOR', {}, WAIT);
    await user.click(screen.getByRole('button', { name: /^Edit options of / }));
    expect(await screen.findByRole('dialog', {}, WAIT)).toBeVisible();
    expect(
      requests.some((line) =>
        /^GET \/api\/attribute-definitions\/[\w-]+$/.test(line),
      ),
    ).toBe(true);
  });
});
