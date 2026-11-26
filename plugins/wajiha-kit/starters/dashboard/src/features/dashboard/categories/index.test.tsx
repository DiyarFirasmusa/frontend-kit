import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS, type Permission } from '@/constants/permissions';
import { attributeHandlers } from '@/mocks/handlers/attributes';
import { categoryHandlers } from '@/mocks/handlers/categories';
import { resetMockDb } from '@/mocks/seed/base';
import { categories } from '@/mocks/seed/categories';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { screen, waitFor, within } from '@/test/render';
import { renderApp } from '@/test/render-app';

const ALL: Permission[] = [
  PERMS.itemCategory.view,
  PERMS.itemCategory.create,
  PERMS.itemCategory.update,
  PERMS.itemCategory.delete,
  PERMS.attributeDefinition.view,
];
const WAIT = { timeout: 5000 };

/** The seed category with this code, as the URL's `category` value. */
function idOf(code: string): string {
  const found = categories.find((category) => category.code === code);
  if (!found) {
    throw new Error(`seed category ${code} missing`);
  }
  return found.id;
}

/** Every category request the page sends, as `METHOD path?query`. */
let requests: string[] = [];
function onRequest({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (
    url.pathname.startsWith('/api/item-categories') ||
    url.pathname.startsWith('/api/attribute-definitions')
  ) {
    requests.push(
      `${request.method} ${url.pathname}${decodeURIComponent(url.search)}`,
    );
  }
}

async function openTree(
  url = '/categories',
  permissions = ALL,
  waitForDetail = true,
) {
  signIn({ roles: [], permissions });
  const view = await renderApp(url);
  await screen.findByRole(
    'heading',
    { level: 1, name: tt('categories.title') },
    WAIT,
  );
  if (waitForDetail) {
    await screen.findByRole(
      'region',
      { name: tt('categories.detail.title') },
      WAIT,
    );
  }
  return view;
}

function detail() {
  return screen.getByRole('region', { name: tt('categories.detail.title') });
}

function assignmentsTable() {
  return within(detail()).getByRole('table', {
    name: tt('categories.assignments.caption'),
  });
}

describe('categories tree page (real route, shared mock backend)', () => {
  beforeEach(() => {
    resetMockDb();
    requests = [];
    server.use(...categoryHandlers, ...attributeHandlers);
    server.events.on('request:start', onRequest);
  });

  afterEach(() => {
    server.events.removeListener('request:start', onRequest);
  });

  it('loads the whole tree in one request and selects the first category', async () => {
    await openTree();
    expect(await within(detail()).findByRole('table', {}, WAIT)).toBeVisible();
    expect(requests[0]).toBe('GET /api/item-categories?page=0&size=1000');
    // The search is empty, so the tree and the lookups share one query: every
    // list request is the same whole-tree request.
    const lists = requests.filter((line) =>
      line.startsWith('GET /api/item-categories?'),
    );
    expect(new Set(lists)).toEqual(
      new Set(['GET /api/item-categories?page=0&size=1000']),
    );
  });

  it('selects a category through the URL and shows own and inherited attributes', async () => {
    const { user, router } = await openTree(
      `/categories?category=${idOf('BLD-STL')}`,
    );
    // BLD-STL links LENGTH itself and inherits ORIGIN and WEIGHT from BLD.
    expect(await within(detail()).findByText('الطول', {}, WAIT)).toBeVisible();
    expect(within(assignmentsTable()).getByText('بلد المنشأ')).toBeVisible();
    expect(
      within(assignmentsTable()).getAllByText(
        tt('categories.assignments.inheritedReadonly'),
      ),
    ).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /^مواد غذائية/ }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        category: idOf('FOOD'),
      });
    });
    expect(
      await within(detail()).findByText('تاريخ الإنتاج', {}, WAIT),
    ).toBeVisible();
  });

  it('shows the All items view from the URL', async () => {
    await openTree('/categories?category=all');
    expect(
      await screen.findByText(tt('categories.detail.allDescription'), {}, WAIT),
    ).toBeVisible();
  });

  it('falls back to the first category when the picked one does not exist', async () => {
    await openTree('/categories?category=nope');
    expect(await within(detail()).findByRole('table', {}, WAIT)).toBeVisible();
  });

  it('searches on the server and keeps the box when nothing matches', async () => {
    const { user, router } = await openTree();
    await screen.findByRole('button', { name: /^مواد بناء/ }, WAIT);
    const box = screen.getByRole('searchbox', {
      name: tt('categories.tree.searchPlaceholder'),
    });
    await user.type(box, 'BLD-CEM');
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: 'BLD-CEM' });
    }, WAIT);
    // The match comes with its parent, so the path stays intact.
    expect(
      await screen.findByRole('button', { name: /^إسمنت وجص/ }, WAIT),
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: /^حديد ومعادن/ })).toBeNull();
    expect(requests).toContain(
      'GET /api/item-categories?page=0&size=1000&q=BLD-CEM',
    );

    await user.clear(box);
    await user.type(box, 'zzz');
    expect(
      await screen.findByText(tt('categories.tree.noMatch'), {}, WAIT),
    ).toBeVisible();
    expect(
      screen.getByRole('searchbox', {
        name: tt('categories.tree.searchPlaceholder'),
      }),
    ).toBeVisible();
  });

  it('reads the search from a shared link', async () => {
    await openTree('/categories?q=FOOD-OIL');
    expect(
      await screen.findByRole('button', { name: /^زيوت ودهون/ }, WAIT),
    ).toBeVisible();
    expect(requests).toContain(
      'GET /api/item-categories?page=0&size=1000&q=FOOD-OIL',
    );
  });

  it('creates a category under the selected parent and selects it', async () => {
    const { user, router } = await openTree(
      `/categories?category=${idOf('OFF')}`,
    );
    await within(detail()).findByRole('table', {}, WAIT);
    await user.click(
      screen.getByRole('button', {
        name: tt('categories.actions.addCategory'),
      }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Category name/), 'Toner');
    await user.click(
      within(dialog).getByRole('button', { name: tt('common.save') }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    }, WAIT);
    const post = requests.find((line) => line.startsWith('POST'));
    expect(post).toBe('POST /api/item-categories');
    await waitFor(() => {
      expect(router.state.location.search.category).not.toBe(idOf('OFF'));
    });
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Toner' }, WAIT),
    ).toBeVisible();
  });

  it('puts a backend field error under the input', async () => {
    const { user } = await openTree(`/categories?category=${idOf('OFF')}`);
    await within(detail()).findByRole('table', {}, WAIT);
    await user.click(
      screen.getByRole('button', {
        name: tt('categories.actions.addCategory'),
      }),
    );
    const dialog = await screen.findByRole('dialog');
    // Same name as a sibling under the same parent.
    await user.type(
      within(dialog).getByLabelText(/^Category name/),
      'ورق وقرطاسية',
    );
    await user.click(
      within(dialog).getByRole('button', { name: tt('common.save') }),
    );
    expect(
      await within(dialog).findByText(
        /A category with this name already exists here|يوجد تصنيف بهذا الاسم/,
        {},
        WAIT,
      ),
    ).toBeVisible();
    expect(within(dialog).getByLabelText(/^Category name/)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(requests.filter((line) => line.startsWith('POST'))).toHaveLength(1);
  });

  it('edits the record loaded by id', async () => {
    const { user } = await openTree(`/categories?category=${idOf('FOOD-OIL')}`);
    await within(detail()).findByRole('table', {}, WAIT);
    await user.click(
      within(detail()).getByRole('button', { name: tt('common.edit') }),
    );
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByLabelText(/^Category name/)).toHaveValue(
        'زيوت ودهون',
      );
    }, WAIT);
    expect(
      requests.some((line) =>
        /^GET \/api\/item-categories\/[\w-]+$/.test(line),
      ),
    ).toBe(true);
  });

  it('opens the move dialog without the expiry field', async () => {
    const { user } = await openTree(`/categories?category=${idOf('FOOD-OIL')}`);
    await within(detail()).findByRole('table', {}, WAIT);
    await user.click(
      within(detail()).getByRole('button', {
        name: tt('categories.actions.move'),
      }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText(tt('categories.form.moveTitle')),
    ).toBeVisible();
    expect(
      within(dialog).queryByLabelText(tt('categories.form.expiryAlertDays')),
    ).toBeNull();
  });

  it('deletes an unused category after a confirm that starts on Cancel', async () => {
    const { user } = await openTree(`/categories?category=${idOf('PKG')}`);
    await within(detail()).findByRole('table', {}, WAIT);
    await user.click(
      within(detail()).getByRole('button', { name: tt('common.delete') }),
    );
    const confirm = await screen.findByRole('alertdialog');
    await waitFor(() => {
      expect(
        within(confirm).getByRole('button', { name: tt('common.cancel') }),
      ).toHaveFocus();
    });
    await user.click(
      within(confirm).getByRole('button', { name: tt('common.delete') }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /^مواد تغليف/ })).toBeNull();
    }, WAIT);
    expect(requests.filter((line) => line.startsWith('DELETE'))).toHaveLength(
      1,
    );
  });

  it('blocks deleting a category that has items, without a request', async () => {
    const { user } = await openTree(`/categories?category=${idOf('FOOD-OIL')}`);
    await within(detail()).findByRole('table', {}, WAIT);
    await user.click(
      within(detail()).getByRole('button', { name: tt('common.delete') }),
    );
    expect(
      await screen.findByRole('dialog', {
        name: tt('categories.blocked.title'),
      }),
    ).toBeVisible();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(requests.some((line) => line.startsWith('DELETE'))).toBe(false);
  });

  it('toggles a required flag and locks the inherited rows', async () => {
    const { user } = await openTree(`/categories?category=${idOf('BLD-STL')}`);
    const row = (await within(detail()).findByText('الطول', {}, WAIT)).closest(
      'tr',
    );
    if (!row) {
      throw new Error('row not found');
    }
    const inherited = (
      await within(assignmentsTable()).findByText('بلد المنشأ')
    ).closest('tr');
    if (!inherited) {
      throw new Error('inherited row not found');
    }
    for (const toggle of within(inherited).getAllByRole('switch')) {
      expect(toggle).toHaveAttribute('aria-disabled', 'true');
    }
    await user.click(within(row).getAllByRole('switch')[1] ?? row);
    await waitFor(() => {
      expect(requests.some((line) => line.startsWith('PUT'))).toBe(true);
    }, WAIT);
  });

  it('links an attribute and detaches it after a confirm', async () => {
    const { user } = await openTree(`/categories?category=${idOf('OFF-INK')}`);
    await within(detail()).findByText(
      tt('categories.assignments.empty'),
      {},
      WAIT,
    );
    await user.click(
      within(detail()).getByRole('button', {
        name: tt('categories.assignments.attach'),
      }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(
      await within(dialog).findByRole('combobox', {
        name: new RegExp(tt('categories.attach.attribute')),
      }),
    );
    await user.click(
      await screen.findByRole('option', { name: /BRAND/ }, WAIT),
    );
    await user.click(
      within(dialog).getByRole('button', {
        name: tt('categories.attach.submit'),
      }),
    );
    const row = (
      await within(assignmentsTable()).findByText('العلامة التجارية', {}, WAIT)
    ).closest('tr');
    if (!row) {
      throw new Error('row not found');
    }
    expect(requests.filter((line) => line.startsWith('POST'))).toHaveLength(1);

    await user.click(within(row).getByRole('button', { name: /^Detach / }));
    const confirm = await screen.findByRole('alertdialog');
    await waitFor(() => {
      expect(
        within(confirm).getByRole('button', { name: tt('common.cancel') }),
      ).toHaveFocus();
    });
    await user.click(
      within(confirm).getByRole('button', {
        name: tt('categories.detach.confirm'),
      }),
    );
    expect(
      await within(detail()).findByText(
        tt('categories.assignments.empty'),
        {},
        WAIT,
      ),
    ).toBeVisible();
    expect(requests.filter((line) => line.startsWith('DELETE'))).toHaveLength(
      1,
    );
  });

  it('hides actions the user may not use', async () => {
    await openTree(`/categories?category=${idOf('FOOD-OIL')}`, [
      PERMS.itemCategory.view,
    ]);
    await within(detail()).findByRole('table', {}, WAIT);
    expect(
      screen.queryByRole('button', {
        name: tt('categories.actions.addCategory'),
      }),
    ).toBeNull();
    expect(
      within(detail()).queryByRole('button', { name: tt('common.edit') }),
    ).toBeNull();
    expect(
      within(detail()).queryByRole('button', { name: tt('common.delete') }),
    ).toBeNull();
    expect(
      within(detail()).queryByRole('button', {
        name: tt('categories.assignments.attach'),
      }),
    ).toBeNull();
  });

  it('shows the error state of the tree and retries', async () => {
    let calls = 0;
    server.use(
      http.get(api(endpoints.itemCategories.list), () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ message: 'down' }, { status: 503 })
          : undefined;
      }),
    );
    const { user } = await openTree('/categories', ALL, false);
    await user.click(
      await screen.findByRole('button', { name: tt('common.tryAgain') }, WAIT),
    );
    expect(
      await screen.findByRole('button', { name: /^مواد بناء/ }, WAIT),
    ).toBeVisible();
  });
});
