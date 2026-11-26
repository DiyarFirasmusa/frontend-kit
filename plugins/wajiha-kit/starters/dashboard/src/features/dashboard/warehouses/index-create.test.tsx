import { HttpResponse, http, type JsonBodyType } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor } from '@/test/render';
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
  server.use(http.get(listUrl, () => HttpResponse.json(body, { status })));
}

function render() {
  return renderWithRouter(<WarehousesListContainer />, { path: '/warehouses' });
}

describe('WarehousesListContainer create dialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    signIn({
      permissions: [
        PERMS.warehouse.view,
        PERMS.warehouse.create,
        PERMS.warehouse.update,
      ],
    });
  });

  it('creates a warehouse from the dialog and posts the exact payload', async () => {
    signIn({
      permissions: [
        PERMS.warehouse.view,
        PERMS.warehouse.create,
        PERMS.warehouse.update,
      ],
    });
    respondWith(rows);
    let body: unknown;
    server.use(
      http.post(api(endpoints.warehouses.create), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(makeWarehouse({ id: 'wh-9' }), {
          status: 201,
        });
      }),
    );
    const { user } = await render();

    await user.click(
      await screen.findByRole('button', { name: tt('warehouses.add') }),
    );
    await user.type(
      await screen.findByLabelText(new RegExp(tt('warehouses.form.name'))),
      'North depot',
    );
    await user.type(
      screen.getByLabelText(new RegExp(tt('warehouses.form.code'))),
      'NTH-01',
    );
    await user.type(
      screen.getByLabelText(new RegExp(tt('warehouses.form.address'))),
      'Basra',
    );
    await user.click(
      screen.getByRole('button', { name: tt('warehouses.form.submit') }),
    );

    await waitFor(() => {
      expect(body).toEqual({
        name: 'North depot',
        code: 'NTH-01',
        address: 'Basra',
        isTransit: false,
        isActive: true,
      });
    });
  });
});
