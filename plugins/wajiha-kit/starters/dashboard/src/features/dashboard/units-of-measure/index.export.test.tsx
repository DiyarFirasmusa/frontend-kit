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
import UnitsOfMeasureListContainer from './index';
import { makeUnitOfMeasure } from './uom-test-utils';

function respondWith(body: JsonBodyType) {
  const requests: URL[] = [];
  server.use(
    http.get(api(endpoints.unitsOfMeasure.list), ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json(body);
    }),
  );
  return requests;
}

function render() {
  return renderWithRouter(<UnitsOfMeasureListContainer />, {
    path: '/units-of-measure',
  });
}

describe('UnitsOfMeasureListContainer export', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/units-of-measure');
  });

  beforeEach(() => {
    signIn({ permissions: [PERMS.unitOfMeasure.read] });
  });

  it('disables export when no units are loaded', async () => {
    respondWith([]);
    await render();
    await screen.findByText(tt('unitsOfMeasure.list.empty'));

    expect(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    ).toBeDisabled();
  });

  it('exports every loaded unit, not only the visible page', async () => {
    const requests = respondWith(
      Array.from({ length: 12 }, (_, index) =>
        makeUnitOfMeasure({ id: `uom-${index}`, code: `U${index + 1}` }),
      ),
    );
    const downloads = recordDownloads();
    const { user } = await render();
    await screen.findByText('U1');
    const before = requests.length;

    await user.click(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    );

    await waitFor(() => {
      expect(downloads.names).toHaveLength(1);
    });
    expect(downloads.names[0]).toMatch(/^units-of-measure-.*\.xlsx$/);
    expect(requests).toHaveLength(before);
    const sheet = await readXlsxRows(downloads.blobs[0]);
    expect(sheet[0]?.[0]).toBe(tt('unitsOfMeasure.col.code'));
    expect(sheet).toHaveLength(13);
    expect(sheet[12]?.[0]).toBe('U12');
  });
});
