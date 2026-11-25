import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor, within } from '@/test/render';
import type { WarehouseResponse } from '@/types/api/warehouses';
import WarehousesListContainer from './index';
import { makeWarehouse } from './warehouse-test-utils';

const listUrl = api(endpoints.warehouses.list);

const allRows: WarehouseResponse[] = Array.from({ length: 11 }, (_, i) =>
  makeWarehouse({
    id: `wh-${i + 1}`,
    name: `Depot ${String(i + 1).padStart(2, '0')}`,
    code: `DEP-${i + 1}`,
  }),
);

describe('WarehousesListContainer delete on the last page', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    signIn({
      permissions: [
        PERMS.warehouse.read,
        PERMS.warehouse.write,
        PERMS.warehouse.delete,
      ],
    });
  });

  it('returns to the first page with rows after deleting the only row on the last page', async () => {
    let remaining = allRows;
    server.use(
      http.get(listUrl, () => HttpResponse.json(remaining)),
      http.delete(api(endpoints.warehouses.remove('wh-11')), () => {
        remaining = allRows.slice(0, 10);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = await renderWithRouter(<WarehousesListContainer />, {
      path: '/warehouses',
    });

    await screen.findByText('Depot 01');
    await user.click(screen.getByRole('button', { name: tt('common.next') }));
    const onlyRow = await screen.findByRole('row', { name: /Depot 11/ });

    await user.click(
      within(onlyRow).getAllByRole('button', {
        name: tt('warehouses.actions.delete'),
      })[0],
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', {
        name: tt('warehouses.delete.confirm'),
      }),
    );

    await waitFor(() => {
      expect(screen.queryByText('Depot 11')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('Depot 01')).toBeInTheDocument();
    expect(
      screen.queryByText(tt('warehouses.list.empty')),
    ).not.toBeInTheDocument();
  });
});
