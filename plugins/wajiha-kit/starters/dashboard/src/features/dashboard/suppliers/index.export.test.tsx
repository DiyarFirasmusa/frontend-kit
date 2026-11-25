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
import SuppliersListContainer from './index';
import { makeSupplier } from './supplier-test-utils';

function respondWith(body: JsonBodyType) {
  const requests: URL[] = [];
  server.use(
    http.get(api(endpoints.suppliers.list), ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json(body);
    }),
  );
  return requests;
}

function render() {
  return renderWithRouter(<SuppliersListContainer />, { path: '/suppliers' });
}

describe('SuppliersListContainer export', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/suppliers');
  });

  beforeEach(() => {
    signIn({ permissions: [PERMS.supplier.read] });
  });

  it('disables export when no suppliers are loaded', async () => {
    respondWith([]);
    await render();
    await screen.findByText(tt('suppliers.empty'));

    expect(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    ).toBeDisabled();
  });

  it('exports every loaded supplier, not only the visible page', async () => {
    const rows = Array.from({ length: 12 }, (_, index) =>
      makeSupplier({ id: `sup-${index}`, code: `SUP-${index + 1}` }),
    );
    const requests = respondWith(rows);
    const downloads = recordDownloads();
    const { user } = await render();
    await screen.findByText('SUP-1');
    const before = requests.length;

    await user.click(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    );

    await waitFor(() => {
      expect(downloads.names).toHaveLength(1);
    });
    expect(downloads.names[0]).toMatch(/^suppliers-.*\.xlsx$/);
    expect(requests).toHaveLength(before);
    const sheet = await readXlsxRows(downloads.blobs[0]);
    expect(sheet[0]?.[0]).toBe(tt('suppliers.columns.code'));
    expect(sheet).toHaveLength(13);
    expect(sheet[12]?.[0]).toBe('SUP-12');
  });
});
