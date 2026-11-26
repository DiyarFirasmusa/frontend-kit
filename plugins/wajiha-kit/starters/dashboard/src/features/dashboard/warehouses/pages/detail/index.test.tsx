import type { JsonBodyType } from 'msw';
import { HttpResponse, delay, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor, within } from '@/test/render';
import { makeLocation, makeWarehouse } from '../../warehouse-test-utils';
import WarehouseDetailContainer from './index';

const detailUrl = api(endpoints.warehouses.detail('wh-1'));
const locationsUrl = api(endpoints.warehouses.locations('wh-1'));
const usersUrl = api(endpoints.warehouses.users('wh-1'));

function respondWith(body: JsonBodyType, status = 200) {
  let calls = 0;
  server.use(
    http.get(detailUrl, () => {
      calls += 1;
      return HttpResponse.json(body, { status });
    }),
    http.get(locationsUrl, () =>
      HttpResponse.json([makeLocation(), makeLocation({ id: 'loc-2' })]),
    ),
    http.get(usersUrl, () => HttpResponse.json([])),
  );
  return () => calls;
}

function render(tab: 'overview' | 'members' | 'locations' = 'overview') {
  return renderWithRouter(
    <WarehouseDetailContainer warehouseId="wh-1" tab={tab} />,
    { path: '/warehouses/wh-1' },
  );
}

describe('WarehouseDetailContainer', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    signIn({ permissions: [PERMS.warehouse.view] });
  });

  it('shows the loading state with the chrome already rendered', async () => {
    server.use(
      http.get(detailUrl, async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
      http.get(locationsUrl, async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );
    await render();

    expect(
      screen.getByRole('navigation', { name: tt('common.breadcrumb') }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the 404 result card for a missing warehouse instead of the page', async () => {
    respondWith({ message: 'Warehouse not found' }, 404);
    await render();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: tt('errorPages.states.notFound.title'),
      }),
    ).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(within(table).getByText('wh-1')).toHaveAttribute('dir', 'ltr');
    expect(
      within(table).getByText(tt('warehouses.detail.recordType')),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', {
        name: tt('warehouses.detail.tabs.overview'),
      }),
    ).not.toBeInTheDocument();
  });

  it('goes back to the warehouses list from the 404 card', async () => {
    respondWith({ message: 'Warehouse not found' }, 404);
    const { user, router } = await render();

    const buttons = await screen.findAllByRole('button', {
      name: tt('errorPages.states.notFound.backToList'),
    });
    await user.click(buttons[0] as HTMLElement);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/warehouses');
    });
  });

  it('shows the transit badge in the header only for a transit warehouse', async () => {
    respondWith(makeWarehouse({ isTransit: true }));
    await render();

    const badges = await screen.findAllByText(
      tt('warehouses.type.transitBadge'),
    );
    expect(badges.some((badge) => badge.closest('header') !== null)).toBe(true);
  });

  it('shows no transit badge for a regular warehouse', async () => {
    respondWith(makeWarehouse({ isTransit: false }));
    await render();

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: makeWarehouse().name ?? '',
    });
    const header = heading.closest('header') as HTMLElement;
    expect(
      within(header).queryByText(tt('warehouses.type.transitBadge')),
    ).not.toBeInTheDocument();
  });

  it('shows the error state and retries', async () => {
    const calls = respondWith({ message: 'boom' }, 500);
    const { user } = await render();

    const alert = await screen.findByRole('alert');
    const before = calls();
    await user.click(
      within(alert).getByRole('button', { name: tt('common.tryAgain') }),
    );

    await waitFor(() => {
      expect(calls()).toBeGreaterThan(before);
    });
  });

  it('renders the overview fields and the location count', async () => {
    respondWith(makeWarehouse({ locationCount: 2 }));
    await render();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Baghdad central warehouse',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('BGD-01')).toBeInTheDocument();
    expect(screen.getByText('2 storage locations')).toBeInTheDocument();
  });

  it('renders the members panel when the tab prop is members', async () => {
    respondWith(makeWarehouse({ locationCount: 2 }));
    await render('members');

    expect(
      await screen.findByText(tt('warehouses.members.empty')),
    ).toBeInTheDocument();
    expect(screen.queryByText('2 storage locations')).not.toBeInTheDocument();
  });

  it('renders the Arabic tab labels', async () => {
    await setTestLanguage('ar');
    respondWith(makeWarehouse());
    await render();

    expect(
      await screen.findByRole('tab', {
        name: tt('warehouses.detail.tabs.members'),
      }),
    ).toBeInTheDocument();
  });

  it('switches the tab and writes it to the search params', async () => {
    respondWith(makeWarehouse());
    const { user, router } = await render();

    await user.click(
      await screen.findByRole('tab', {
        name: tt('warehouses.detail.tabs.members'),
      }),
    );

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ tab: 'members' });
    });
  });

  it('deletes the warehouse and returns to the list', async () => {
    signIn({ permissions: [PERMS.warehouse.view, PERMS.warehouse.delete] });
    respondWith(makeWarehouse());
    const onDelete = vi.fn();
    server.use(
      http.delete(api(endpoints.warehouses.remove('wh-1')), () => {
        onDelete();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user, router } = await render();

    await user.click(
      await screen.findByRole('button', {
        name: tt('warehouses.actions.delete'),
      }),
    );
    const dialog = await screen.findByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', {
        name: tt('warehouses.delete.confirm'),
      }),
    );

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/warehouses');
    });
  });
});
