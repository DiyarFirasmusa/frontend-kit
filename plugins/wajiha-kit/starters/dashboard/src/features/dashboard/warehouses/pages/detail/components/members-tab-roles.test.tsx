import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { makeWarehouseMember } from '../../../warehouse-test-utils';
import { MembersTab } from './members-tab';

const USER_A = '6f1d2c3a-0000-4000-8000-000000000002';
const USER_B = '9a8b7c6d-0000-4000-8000-000000000003';

function serveMembers(rows: ReturnType<typeof makeWarehouseMember>[]) {
  server.use(
    http.get(api(endpoints.warehouses.users('wh-1')), () =>
      HttpResponse.json(rows),
    ),
  );
}

describe('MembersTab roles', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    signIn({ permissions: [PERMS.warehouse.read, PERMS.warehouse.write] });
  });

  it('shows the role, the manager badge and the active status from the backend', async () => {
    signIn({ permissions: [PERMS.warehouse.read] });
    serveMembers([
      makeWarehouseMember({
        id: 'm-1',
        userId: USER_A,
        userName: 'Sara',
        role: 'WAREHOUSE_MANAGER',
        isManager: true,
      }),
      makeWarehouseMember({
        id: 'm-2',
        userId: USER_B,
        userName: 'Omar',
        role: 'STOCK_CONTROLLER',
        isActive: false,
      }),
    ]);
    renderWithProviders(<MembersTab warehouseId="wh-1" />);

    expect(
      await screen.findByText(tt('warehouses.members.roles.WAREHOUSE_MANAGER')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(tt('warehouses.members.roles.STOCK_CONTROLLER')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(tt('warehouses.members.managerBadge')),
    ).toBeInTheDocument();
    expect(screen.getByText(tt('warehouses.members.active'))).toBeVisible();
    expect(screen.getByText(tt('warehouses.members.inactive'))).toBeVisible();
    expect(screen.getByText('Sa')).toBeInTheDocument();
  });

  it('changes a member role with a single PUT and refetches the members', async () => {
    let body: unknown;
    let putPath = '';
    let listCalls = 0;
    server.use(
      http.get(api(endpoints.warehouses.users('wh-1')), () => {
        listCalls += 1;
        return HttpResponse.json([
          makeWarehouseMember({
            userId: USER_A,
            userName: 'Sara',
            role: listCalls === 1 ? 'STOREKEEPER' : 'STOCK_CONTROLLER',
          }),
        ]);
      }),
      http.put(
        api(endpoints.warehouses.changeUserRole('wh-1', USER_A)),
        async ({ request }) => {
          body = await request.json();
          putPath = new URL(request.url).pathname;
          return HttpResponse.json(
            makeWarehouseMember({ userId: USER_A, role: 'STOCK_CONTROLLER' }),
          );
        },
      ),
    );
    const { user } = renderWithProviders(<MembersTab warehouseId="wh-1" />);

    await user.click(
      await screen.findByRole('combobox', {
        name: `${tt('warehouses.members.changeRole')}: Sara`,
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: tt('warehouses.members.roles.STOCK_CONTROLLER'),
      }),
    );

    await waitFor(() => {
      expect(body).toEqual({ role: 'STOCK_CONTROLLER' });
    });
    expect(putPath).toBe(`/api/warehouses/wh-1/users/${USER_A}`);
    await waitFor(() => {
      expect(listCalls).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows the role as plain text without warehouse:write', async () => {
    signIn({ permissions: [PERMS.warehouse.read], roles: [] });
    serveMembers([makeWarehouseMember({ userId: USER_A, userName: 'Sara' })]);
    renderWithProviders(<MembersTab warehouseId="wh-1" />);

    expect(
      await screen.findByText(tt('warehouses.members.roles.STOREKEEPER')),
    ).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('translates the member role in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/warehouses');
    signIn({ permissions: [PERMS.warehouse.read] });
    serveMembers([
      makeWarehouseMember({ userName: 'Sara', role: 'STOREKEEPER' }),
    ]);
    renderWithProviders(<MembersTab warehouseId="wh-1" />);

    expect(await screen.findByText('أمين المخزن')).toBeInTheDocument();
  });
});
