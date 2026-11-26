import { HttpResponse, delay, http, type JsonBodyType } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, waitFor, within } from '@/test/render';
import { makeWarehouseMember } from '../../../warehouse-test-utils';
import { MembersTab } from './members-tab';

const membersUrl = api(endpoints.warehouses.users('wh-1'));
const USER_A = '6f1d2c3a-0000-4000-8000-000000000002';
const USER_B = '9a8b7c6d-0000-4000-8000-000000000003';

function respondWith(body: JsonBodyType, status = 200) {
  server.use(http.get(membersUrl, () => HttpResponse.json(body, { status })));
}

describe('MembersTab', () => {
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

  it('shows the loading state', () => {
    server.use(
      http.get(membersUrl, async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(<MembersTab warehouseId="wh-1" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows an error and retries the request', async () => {
    let calls = 0;
    server.use(
      http.get(membersUrl, () => {
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json({ message: 'boom' }, { status: 500 });
        }
        return HttpResponse.json([makeWarehouseMember({ userId: USER_A })]);
      }),
    );
    const { user } = renderWithProviders(<MembersTab warehouseId="wh-1" />);

    await user.click(
      await screen.findByRole('button', { name: tt('common.tryAgain') }),
    );

    expect(await screen.findByText('Sara Ali')).toBeInTheDocument();
  });

  it('shows the empty message when there are no members', async () => {
    respondWith([]);
    renderWithProviders(<MembersTab warehouseId="wh-1" />);

    expect(
      await screen.findByText(tt('warehouses.members.empty')),
    ).toBeInTheDocument();
  });

  it('renders each member with the name the backend returns', async () => {
    respondWith([
      makeWarehouseMember({ id: 'm-1', userId: USER_A, userName: 'Sara Ali' }),
      makeWarehouseMember({ id: 'm-2', userId: USER_B, userName: 'Omar Hadi' }),
    ]);
    renderWithProviders(<MembersTab warehouseId="wh-1" />);

    const rows = await screen.findAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText('Sara Ali')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('Omar Hadi')).toBeInTheDocument();
  });

  it('renders an em dash when the member has no name', async () => {
    respondWith([makeWarehouseMember({ userId: USER_A, userName: null })]);
    renderWithProviders(<MembersTab warehouseId="wh-1" />);

    await screen.findByRole('listitem');
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('hides the add and remove actions without warehouse:write', async () => {
    signIn({ permissions: [PERMS.warehouse.view], roles: [] });
    respondWith([makeWarehouseMember({ userId: USER_A })]);
    renderWithProviders(<MembersTab warehouseId="wh-1" />);

    await screen.findByText('Sara Ali');
    expect(
      screen.queryByRole('button', { name: tt('warehouses.members.add') }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: tt('warehouses.members.remove') }),
    ).not.toBeInTheDocument();
  });

  it('removes a member after confirmation and refetches the members', async () => {
    let deletedPath: string | null = null;
    let listCalls = 0;
    server.use(
      http.get(membersUrl, () => {
        listCalls += 1;
        const rows =
          listCalls === 1 ? [makeWarehouseMember({ userId: USER_A })] : [];
        return HttpResponse.json(rows);
      }),
      http.delete(
        api(endpoints.warehouses.removeUser('wh-1', USER_A)),
        ({ request }) => {
          deletedPath = new URL(request.url).pathname;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );
    const { user } = renderWithProviders(<MembersTab warehouseId="wh-1" />);

    await user.click(
      await screen.findByRole('button', {
        name: new RegExp(tt('warehouses.members.menu')),
      }),
    );
    await user.click(
      await screen.findByRole('menuitem', {
        name: tt('warehouses.members.remove'),
      }),
    );
    const dialog = await screen.findByRole('alertdialog');
    await user.click(
      within(dialog).getByRole('button', {
        name: tt('warehouses.members.removeConfirm'),
      }),
    );

    await waitFor(() => {
      expect(deletedPath).toBe(`/api/warehouses/wh-1/users/${USER_A}`);
    });
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(listCalls).toBeGreaterThanOrEqual(2);
    expect(
      await screen.findByText(tt('warehouses.members.empty')),
    ).toBeInTheDocument();
  });

  it('renders Arabic labels when the language is ar', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/warehouses');
    respondWith([makeWarehouseMember({ userId: USER_A })]);
    renderWithProviders(<MembersTab warehouseId="wh-1" />);

    expect(
      await screen.findByRole('button', { name: 'إضافة عضو' }),
    ).toBeInTheDocument();
    expect(screen.getByText('أعضاء المستودع')).toBeInTheDocument();
  });
});
