import { HttpResponse, delay, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import { makeLocation } from '../../../warehouse-test-utils';
import { LocationsTab } from './locations-tab';

const url = api(endpoints.warehouses.locations('wh-1'));

const twoLocations = [
  makeLocation({ id: 'zone', code: 'ZONE-A', name: 'Storage hall A' }),
  makeLocation({
    id: 'rack',
    code: 'RACK-1',
    name: 'Rack one',
    parentId: 'zone',
  }),
];

function render() {
  return renderWithRouter(<LocationsTab warehouseId="wh-1" />, {
    path: '/warehouses/wh-1',
  });
}

describe('LocationsTab', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    signIn({
      roles: [],
      permissions: [PERMS.warehouse.read],
    });
  });

  it('shows skeleton while the locations are loading', async () => {
    server.use(
      http.get(url, async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );
    await render();

    expect(
      document.querySelector('[data-slot="wrapper-loading"]'),
    ).toBeInTheDocument();
  });

  it('shows the error state and retries the request', async () => {
    let calls = 0;
    server.use(
      http.get(url, () => {
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json({ message: 'boom' }, { status: 500 });
        }
        return HttpResponse.json(twoLocations);
      }),
    );
    const { user } = await render();

    expect(
      await screen.findByRole('button', { name: tt('common.tryAgain') }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: tt('common.tryAgain') }),
    );

    expect(await screen.findByText('Storage hall A')).toBeInTheDocument();
  });

  it('shows the empty message when the warehouse has no locations', async () => {
    server.use(http.get(url, () => HttpResponse.json([])));
    await render();

    expect(
      await screen.findByText(tt('warehouses.locations.empty')),
    ).toBeInTheDocument();
  });

  it('shows the summary and the tree on success', async () => {
    server.use(http.get(url, () => HttpResponse.json(twoLocations)));
    await render();

    expect(
      await screen.findByText(
        tt('warehouses.locations.summary', { count: 2, zones: 1 }),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Storage hall A')).toBeInTheDocument();
    expect(
      screen.getByText(tt('warehouses.locations.childCount', { count: 1 })),
    ).toBeInTheDocument();
    expect(screen.queryByText('Rack one')).not.toBeInTheDocument();
  });

  it('hides the open-tree button without location:read', async () => {
    signIn({ roles: [], permissions: [PERMS.warehouse.read] });
    server.use(http.get(url, () => HttpResponse.json(twoLocations)));
    await render();

    await screen.findByText('Storage hall A');
    await waitFor(() => {
      expect(
        screen.queryByRole('button', {
          name: tt('warehouses.locations.openTree'),
        }),
      ).not.toBeInTheDocument();
    });
  });

  it('renders the Arabic title and summary', async () => {
    await setTestLanguage('ar');
    server.use(http.get(url, () => HttpResponse.json(twoLocations)));
    await render();

    expect(
      await screen.findByText(
        tt('warehouses.locations.summary', { count: 2, zones: 1 }),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(tt('warehouses.locations.title')),
    ).toBeInTheDocument();
  });
});
