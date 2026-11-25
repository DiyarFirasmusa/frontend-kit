import type { UserEvent } from '@testing-library/user-event';
import { HttpResponse, delay, http, type JsonBodyType } from 'msw';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import UnitsOfMeasureListContainer from './index';
import { makeUnitOfMeasure } from './uom-test-utils';
const listUrl = api(endpoints.unitsOfMeasure.list);
const unit = (id: string, code: string, name: string, decimals: number) =>
  makeUnitOfMeasure({ id, code, name, decimalPlaces: decimals });

const rows = [
  unit('uom-1', 'PCS', 'Piece', 0),
  unit('uom-2', 'KG', 'Kilogram', 3),
  unit('uom-3', 'MTR', 'Meter', 2),
];

const pagedRows = Array.from({ length: 25 }, (_, i) =>
  unit(`uom-${i}`, `C${i}`, `Unit ${i}`, i < 15 ? 0 : 2),
);

function respondWith(body: JsonBodyType, status = 200) {
  const requests: URL[] = [];
  server.use(
    http.get(listUrl, ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      const decimals = url.searchParams.get('decimalPlaces');
      if (decimals !== null && Array.isArray(body)) {
        return HttpResponse.json(
          body.filter(
            (row) =>
              (row as { decimalPlaces: number }).decimalPlaces ===
              Number(decimals),
          ),
        );
      }
      return HttpResponse.json(body, { status });
    }),
  );
  return requests;
}

function render() {
  return renderWithRouter(<UnitsOfMeasureListContainer />, {
    path: '/units-of-measure',
  });
}

function expectTitle(name = tt('unitsOfMeasure.title')) {
  expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument();
}

async function chooseDecimals(user: UserEvent, value: string) {
  await user.click(
    screen.getByRole('combobox', {
      name: tt('unitsOfMeasure.list.decimalsFilter'),
    }),
  );
  await user.click(await screen.findByRole('option', { name: value }));
}

describe('UnitsOfMeasureListContainer', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/units-of-measure');
  });

  beforeEach(() => {
    signIn({ permissions: [PERMS.unitOfMeasure.read] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows skeleton rows while loading', async () => {
    server.use(
      http.get(listUrl, async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );
    await render();

    expectTitle();
    expect(document.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  });

  it('shows the load error and retries the request', async () => {
    const requests = respondWith({ message: 'boom' }, 500);
    const { user } = await render();

    expect(await screen.findByText(tt('common.loadError'))).toBeInTheDocument();
    const before = requests.length;
    await user.click(
      await screen.findByRole('button', { name: tt('common.tryAgain') }),
    );

    await waitFor(() => {
      expect(requests.length).toBeGreaterThan(before);
    });
  });

  it('shows the empty message and hides create without write permission', async () => {
    signIn({ roles: [], permissions: [PERMS.unitOfMeasure.read] });
    respondWith([]);
    await render();

    expect(
      await screen.findByText(tt('unitsOfMeasure.list.empty')),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: tt('unitsOfMeasure.add') }),
    ).not.toBeInTheDocument();
  });

  it('shows rows with examples, then asks the server to narrow by decimals', async () => {
    const requests = respondWith(rows);
    const { user } = await render();
    expect(await screen.findByText('PCS')).toBeInTheDocument();
    expect(screen.getByText('KG')).toBeInTheDocument();
    expect(screen.getByText('12.346')).toBeInTheDocument();
    const before = requests.length;

    await chooseDecimals(user, '3');

    await waitFor(() => {
      expect(screen.queryByText('PCS')).not.toBeInTheDocument();
    });
    expect(screen.getByText('KG')).toBeInTheDocument();
    expect(requests.length).toBeGreaterThan(before);
    expect(requests.at(-1)?.searchParams.get('decimalPlaces')).toBe('3');
  });

  it('resets to the first page when the decimals filter changes', async () => {
    respondWith(pagedRows);
    const { user } = await render();
    await screen.findByText('C0');

    await user.click(screen.getByRole('button', { name: tt('common.next') }));
    expect(await screen.findByText('11–20')).toBeInTheDocument();

    await chooseDecimals(user, '0');

    expect(await screen.findByText('1–10')).toBeInTheDocument();
    expect(screen.queryByText('11–15')).not.toBeInTheDocument();
  });

  it('sends the debounced search term to the server as q', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const requests = respondWith(rows);
    const { user } = await render();
    await screen.findByText('KG');

    await user.type(
      screen.getByRole('searchbox', { name: tt('common.search') }),
      'kilo',
    );
    vi.advanceTimersByTime(400);

    await waitFor(() => {
      expect(requests.at(-1)?.searchParams.get('q')).toBe('kilo');
    });
    const partial = requests.some((url) =>
      ['k', 'ki', 'kil'].includes(url.searchParams.get('q') ?? ''),
    );
    expect(partial).toBe(false);
  });

  it('opens the create dialog from the create button', async () => {
    signIn({
      roles: [],
      permissions: [PERMS.unitOfMeasure.read, PERMS.unitOfMeasure.write],
    });
    respondWith(rows);
    const { user } = await render();

    await user.click(
      await screen.findByRole('button', { name: tt('unitsOfMeasure.add') }),
    );

    expect(
      await screen.findByText(tt('unitsOfMeasure.form.createTitle')),
    ).toBeInTheDocument();
  });

  it('renders the page title in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/units-of-measure');
    respondWith([]);
    await render();
    expectTitle('وحدات القياس');
  });
});
