import { HttpResponse, http } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { AUDIT_ENTITY } from '@/constants/audit-entities';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen } from '@/test/render';
import { makeLocation, makeWarehouse } from '../../warehouse-test-utils';
import WarehouseDetailContainer from './index';

// Non-SUPERADMIN role so the permission checks are not bypassed.
const ROLES = ['STAFF'];

function respond() {
  server.use(
    http.get(api(endpoints.warehouses.detail('wh-1')), () =>
      HttpResponse.json(makeWarehouse()),
    ),
    http.get(api(endpoints.warehouses.locations('wh-1')), () =>
      HttpResponse.json([makeLocation()]),
    ),
    http.get(api(endpoints.warehouses.users('wh-1')), () =>
      HttpResponse.json([]),
    ),
  );
}

function render() {
  return renderWithRouter(
    <WarehouseDetailContainer warehouseId="wh-1" tab="overview" />,
    { path: '/warehouses/wh-1' },
  );
}

describe('WarehouseDetailContainer access control', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  it('hides edit and delete for a read-only user', async () => {
    signIn({ roles: ROLES, permissions: [PERMS.warehouse.read] });
    respond();
    await render();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Baghdad central warehouse',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: tt('warehouses.actions.edit') }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: tt('warehouses.actions.delete') }),
    ).not.toBeInTheDocument();
  });

  it('shows edit but not delete for a user with write only', async () => {
    signIn({
      roles: ROLES,
      permissions: [PERMS.warehouse.read, PERMS.warehouse.write],
    });
    respond();
    await render();

    expect(
      await screen.findByRole('button', {
        name: tt('warehouses.actions.edit'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: tt('warehouses.actions.delete') }),
    ).not.toBeInTheDocument();
  });

  it('opens the warehouse change log for a read-only user', async () => {
    signIn({
      roles: ROLES,
      permissions: [PERMS.warehouse.read, PERMS.auditLog.read],
    });
    respond();
    const requests: URL[] = [];
    server.use(
      http.get(api(endpoints.auditLog.list), ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json({
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        });
      }),
    );
    const { user } = await render();

    await user.click(
      await screen.findByRole('button', { name: tt('auditLog.open') }),
    );

    expect(await screen.findByText(tt('auditLog.empty'))).toBeInTheDocument();
    expect(requests[0]?.searchParams.get('entity')).toBe(
      AUDIT_ENTITY.warehouse,
    );
    expect(requests[0]?.searchParams.get('entityId')).toBe('wh-1');
  });
});
