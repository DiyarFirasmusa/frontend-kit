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
import { readXlsxRows, recordDownloads } from '@/test/xlsx';
import WarehousesListContainer from './index';
import { makeWarehouse } from './warehouse-test-utils';

function respondWith(body: JsonBodyType) {
  const requests: URL[] = [];
  server.use(
    http.get(api(endpoints.warehouses.list), ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json(body);
    }),
  );
  return requests;
}

function render() {
  return renderWithRouter(<WarehousesListContainer />, { path: '/warehouses' });
}

describe('WarehousesListContainer export', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    signIn({ roles: [], permissions: [PERMS.warehouse.read] });
  });

  it('disables export when no rows are loaded', async () => {
    respondWith([]);
    await render();
    await screen.findByText(tt('warehouses.list.empty'));

    expect(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    ).toBeDisabled();
  });

  it('exports every loaded warehouse, not only the visible page', async () => {
    const rows = Array.from({ length: 12 }, (_, index) =>
      makeWarehouse({ id: `wh-${index}`, code: `WH-${index + 1}` }),
    );
    const requests = respondWith(rows);
    const downloads = recordDownloads();
    const { user } = await render();
    await screen.findByText('WH-1');
    const before = requests.length;

    await user.click(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    );

    await waitFor(() => {
      expect(downloads.names).toHaveLength(1);
    });
    expect(downloads.names[0]).toMatch(/^warehouses-.*\.xlsx$/);
    expect(requests).toHaveLength(before);
    const sheet = await readXlsxRows(downloads.blobs[0]);
    expect(sheet[0]?.[0]).toBe(tt('warehouses.col.code'));
    expect(sheet).toHaveLength(13);
    expect(sheet[12]?.[0]).toBe('WH-12');
  });
});
