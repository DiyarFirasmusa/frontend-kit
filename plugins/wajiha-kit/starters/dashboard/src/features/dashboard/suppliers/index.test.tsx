import { HttpResponse, delay, http, type JsonBodyType } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor, within } from '@/test/render';
import SuppliersListContainer from './index';
import { makeSupplier } from './supplier-test-utils';

const listUrl = api(endpoints.suppliers.list);

function respondWith(body: JsonBodyType, status = 200) {
  const requests: URL[] = [];
  server.use(
    http.get(listUrl, ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json(body, { status });
    }),
  );
  return requests;
}

function renderList() {
  return renderWithRouter(<SuppliersListContainer />, { path: '/suppliers' });
}

describe('SuppliersListContainer', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/suppliers');
  });

  beforeEach(() => {
    signIn({
      permissions: [
        PERMS.supplier.read,
        PERMS.supplier.write,
        PERMS.supplier.delete,
      ],
    });
  });

  it('shows skeleton rows while loading', async () => {
    server.use(
      http.get(listUrl, async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );
    await renderList();
    expect(
      screen.getByRole('heading', { level: 1, name: tt('suppliers.title') }),
    ).toBeInTheDocument();
    expect(
      document.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it('shows the error state with a retry', async () => {
    respondWith({ message: 'bad' }, 400);
    await renderList();
    expect(await screen.findByText(tt('common.loadError'))).toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    respondWith([]);
    await renderList();
    expect(await screen.findByText(tt('suppliers.empty'))).toBeInTheDocument();
  });

  it('lists suppliers and asks for registered, capped rows by default', async () => {
    const requests = respondWith([
      makeSupplier(),
      makeSupplier({
        id: 'sup-2',
        code: 'SUP-002',
        name: 'Tigris',
        phone: null,
      }),
    ]);
    await renderList();
    const table = within(await screen.findByRole('table'));
    expect(await table.findByText('Rafidain Supplies')).toBeInTheDocument();
    expect(table.getByText('Tigris')).toBeInTheDocument();
    const params = requests[0]?.searchParams;
    expect(params?.get('limit')).toBe('500');
    expect(params?.has('includeUnregistered')).toBe(false);
  });

  it('creates a supplier from the dialog', async () => {
    respondWith([]);
    let body: unknown;
    server.use(
      http.post(api(endpoints.suppliers.create), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(makeSupplier({ id: 'sup-9' }), {
          status: 201,
        });
      }),
    );
    const { user } = await renderList();
    await screen.findByText(tt('suppliers.empty'));
    await user.click(
      screen.getByRole('button', { name: tt('suppliers.create') }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(
      within(dialog).getByLabelText(tt('suppliers.dialog.code'), {
        exact: false,
      }),
      'SUP-9',
    );
    await user.type(
      within(dialog).getByLabelText(tt('suppliers.dialog.name'), {
        exact: false,
      }),
      'Acme',
    );
    await user.click(
      within(dialog).getByRole('button', { name: tt('suppliers.dialog.save') }),
    );
    await waitFor(() => {
      expect(body).toEqual({ code: 'SUP-9', name: 'Acme', isActive: true });
    });
  });

  it('deactivates a supplier on documents instead of deleting it', async () => {
    respondWith([makeSupplier({ inUse: true })]);
    let body: unknown;
    server.use(
      http.put(
        api(endpoints.suppliers.update('sup-1')),
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(makeSupplier({ isActive: false }));
        },
      ),
    );
    const { user } = await renderList();
    const table = within(await screen.findByRole('table'));
    await table.findByText('Rafidain Supplies');
    await user.click(
      table.getByRole('button', { name: tt('suppliers.actions.deactivate') }),
    );
    const confirm = await screen.findByRole('dialog');
    await user.click(
      within(confirm).getByRole('button', {
        name: tt('suppliers.actions.deactivate'),
      }),
    );
    await waitFor(() => {
      expect(body).toMatchObject({ code: 'SUP-001', isActive: false });
    });
  });

  it('renders the title in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/suppliers');
    respondWith([]);
    await renderList();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'الموردون' }),
    ).toBeInTheDocument();
  });
});
