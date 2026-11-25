import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen } from '@/test/render';
import { makeWarehouse } from '../../warehouse-test-utils';
import WarehouseDetailContainer from './index';

const locationsUrl = api(endpoints.warehouses.locations('wh-1'));

describe('WarehouseDetailContainer map card', () => {
  let locationCalls = 0;

  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    locationCalls = 0;
    signIn({ roles: ['STAFF'], permissions: [PERMS.warehouse.read] });
    server.use(
      http.get(api(endpoints.warehouses.detail('wh-1')), () =>
        HttpResponse.json(makeWarehouse({ locationCount: 84 })),
      ),
      http.get(api(endpoints.warehouses.users('wh-1')), () =>
        HttpResponse.json([]),
      ),
      http.get(locationsUrl, () => {
        locationCalls += 1;
        return HttpResponse.json([]);
      }),
    );
  });

  it('reads the count from the warehouse without fetching every location', async () => {
    await renderWithRouter(
      <WarehouseDetailContainer warehouseId="wh-1" tab="overview" />,
      { path: '/warehouses/wh-1' },
    );

    expect(await screen.findByText('84 storage locations')).toBeInTheDocument();
    expect(locationCalls).toBe(0);
  });

  it('renders the Arabic count', async () => {
    await setTestLanguage('ar');
    await renderWithRouter(
      <WarehouseDetailContainer warehouseId="wh-1" tab="overview" />,
      { path: '/warehouses/wh-1' },
    );

    expect(
      await screen.findByText(
        tt('warehouses.overview.mapCount', { count: 84 }),
      ),
    ).toBeInTheDocument();
    expect(locationCalls).toBe(0);
  });
});
