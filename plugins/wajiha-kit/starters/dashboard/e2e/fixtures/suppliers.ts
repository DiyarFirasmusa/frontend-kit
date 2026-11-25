import type { Page } from '@playwright/test';
import type { SupplierResponse } from '../../src/types/api/suppliers';

function supplier(overrides: Partial<SupplierResponse>): SupplierResponse {
  return {
    id: '7a1d2a10-0000-4000-8000-000000000001',
    code: 'SUP-001',
    name: 'شركة الرافدين للتجهيزات',
    contactName: 'علي حسن',
    phone: '+964 780 000 0001',
    email: 'orders@rafidain.example',
    address: 'بغداد، الكرادة',
    taxNumber: '100200300',
    notes: null,
    isActive: true,
    registered: true,
    inUse: false,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
    ...overrides,
  };
}

export const supplierRows: SupplierResponse[] = [
  supplier({}),
  supplier({
    id: '7a1d2a10-0000-4000-8000-000000000002',
    code: 'SUP-002',
    name: 'مؤسسة المثال',
    contactName: null,
    inUse: true,
  }),
  supplier({
    id: '7a1d2a10-0000-4000-8000-000000000003',
    code: 'SUP-003',
    name: 'مكتب الفرات',
    isActive: false,
  }),
];

export interface SupplierMockState {
  lastQuery: string | null;
  writes: { method: string; id: string | null; body: unknown }[];
}

/** In-memory stub for /api/suppliers: GET filters by `q`, writes change the list. */
export async function mockSuppliers(
  page: Page,
  initial: SupplierResponse[] = supplierRows,
): Promise<SupplierMockState> {
  let rows = [...initial];
  const state: SupplierMockState = { lastQuery: null, writes: [] };

  await page.route(
    (url) => url.pathname.startsWith('/api/suppliers'),
    async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const id = url.pathname.split('/')[3] ?? null;
      const method = request.method();

      if (method === 'GET') {
        const q = url.searchParams.get('q');
        state.lastQuery = q;
        const needle = q?.toLowerCase() ?? '';
        await route.fulfill({
          json: rows.filter(
            (row) =>
              needle === '' ||
              (row.code ?? '').toLowerCase().includes(needle) ||
              (row.name ?? '').toLowerCase().includes(needle),
          ),
        });
        return;
      }

      const body = request.postDataJSON() as Partial<SupplierResponse> | null;
      state.writes.push({ method, id, body });
      if (method === 'POST') {
        const created = supplier({
          ...body,
          id: `7a1d2a10-0000-4000-8000-0000000000${rows.length + 10}`,
        });
        rows = [...rows, created];
        await route.fulfill({ status: 201, json: created });
        return;
      }
      if (method === 'PUT') {
        rows = rows.map((row) => (row.id === id ? { ...row, ...body } : row));
        await route.fulfill({ json: rows.find((row) => row.id === id) });
        return;
      }
      rows = rows.filter((row) => row.id !== id);
      await route.fulfill({ status: 204, body: '' });
    },
  );
  return state;
}
