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
import WarehousesListContainer from './index';
import { makeWarehouse } from './warehouse-test-utils';

const listUrl = api(endpoints.warehouses.list);

const rows = [
  makeWarehouse({ id: 'wh-1', name: 'Baghdad central', code: 'BGD-01' }),
  makeWarehouse({
    id: 'wh-2',
    name: 'Erbil transit hub',
    code: 'ERB-TR',
    address: null,
    isTransit: true,
    managerUserId: null,
  }),
];

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

function render() {
  return renderWithRouter(<WarehousesListContainer />, { path: '/warehouses' });
}

describe('WarehousesListContainer', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    signIn({ roles: [], permissions: [PERMS.warehouse.read] });
  });

  it('shows skeleton rows while the list is loading', async () => {
    server.use(
      http.get(listUrl, async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );
    await render();

    expect(
      screen.getByRole('heading', { level: 1, name: tt('warehouses.title') }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        document.querySelectorAll('[data-slot="skeleton"]').length,
      ).toBeGreaterThan(0);
    });
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    expect(screen.queryByText('Baghdad central')).not.toBeInTheDocument();
    expect(
      screen.queryByText(tt('warehouses.list.empty')),
    ).not.toBeInTheDocument();
  });

  it('shows the error state and retries the request', async () => {
    const requests = respondWith({ message: 'boom' }, 500);
    const { user } = await render();

    const retry = await screen.findByRole('button', {
      name: tt('common.tryAgain'),
    });
    const before = requests.length;
    await user.click(retry);

    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(before);
    });
  });

  it('shows the empty message when the API returns no rows', async () => {
    respondWith([]);
    await render();

    expect(
      await screen.findByText(tt('warehouses.list.empty')),
    ).toBeInTheDocument();
  });

  it('renders rows with an em dash for empty values', async () => {
    respondWith(rows);
    await render();

    expect(await screen.findByText('Baghdad central')).toBeInTheDocument();
    expect(screen.getByText('BGD-01')).toBeInTheDocument();
    expect(screen.getByText('Erbil transit hub')).toBeInTheDocument();
    const row = screen.getByRole('row', { name: /Erbil transit hub/ });
    expect(within(row).getAllByText('—')).toHaveLength(4);
  });

  it('sends the debounced search term to the server', async () => {
    const requests = respondWith(rows);
    const { user } = await render();
    await screen.findByText('Baghdad central');

    await user.type(
      screen.getByRole('searchbox', { name: tt('common.search') }),
      'erbil',
    );

    await waitFor(() => {
      expect(requests.at(-1)?.searchParams.get('q')).toBe('erbil');
    });
    expect(
      requests
        .filter((url) => url.searchParams.has('q'))
        .map((url) => url.searchParams.get('q')),
    ).toEqual(['erbil']);
  });

  it('sends the warehouse type filter to the server', async () => {
    const requests = respondWith(rows);
    const { user } = await render();
    await screen.findByText('Baghdad central');

    await user.click(
      screen.getByRole('combobox', { name: tt('warehouses.list.filterType') }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: tt('warehouses.type.transit'),
      }),
    );

    await waitFor(() => {
      expect(requests.at(-1)?.searchParams.get('isTransit')).toBe('true');
    });
    expect(requests.at(-1)?.searchParams.has('isActive')).toBe(false);
  });

  it('renders the location and member counts', async () => {
    respondWith([
      makeWarehouse({
        id: 'wh-9',
        name: 'Basra',
        locationCount: 84,
        memberCount: 6,
      }),
    ]);
    await render();

    const row = await screen.findByRole('row', { name: /Basra/ });
    expect(within(row).getByText('84')).toBeInTheDocument();
    expect(within(row).getByText('6')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: tt('warehouses.col.members') }),
    ).toBeInTheDocument();
  });

  it('hides the create button without write permission', async () => {
    respondWith([]);
    await render();

    expect(
      screen.queryByRole('button', { name: tt('warehouses.add') }),
    ).not.toBeInTheDocument();
  });

  it('renders the page title and count headers in Arabic', async () => {
    await setTestLanguage('ar');
    respondWith([]);
    await render();
    expect(
      screen.getByRole('heading', { level: 1, name: tt('warehouses.title') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {
        name: tt('warehouses.col.locations'),
      }),
    ).toBeInTheDocument();
  });
});
