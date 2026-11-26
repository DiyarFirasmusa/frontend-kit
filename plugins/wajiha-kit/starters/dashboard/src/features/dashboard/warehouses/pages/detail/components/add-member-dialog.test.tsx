import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { serveDirectorySearch } from '@/test/msw/directory';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { pickPerson } from '@/test/pick-person';
import { renderWithProviders, screen, waitFor, within } from '@/test/render';
import { makeWarehouseMember } from '../../../warehouse-test-utils';
import { useAddMemberForm } from '../hooks/form/use-add-member-form';
import { AddMemberDialog } from './add-member-dialog';

const VALID_UUID = '6f1d2c3a-0000-4000-8000-000000000002';

function Harness() {
  const dialog = useAddMemberForm('wh-1');
  return (
    <>
      <Button onClick={dialog.openAdd}>open add</Button>
      <AddMemberDialog dialog={dialog} />
    </>
  );
}

function renderHarness() {
  return renderWithProviders(<Harness />);
}

describe('AddMemberDialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    serveDirectorySearch([{ id: VALID_UUID, name: 'Sara Ali' }]);
    signIn({ permissions: [PERMS.warehouse.create, PERMS.warehouse.update] });
  });

  it('POSTs { userId, role } on submit and closes', async () => {
    let body: unknown;
    server.use(
      http.post(
        api(endpoints.warehouses.users('wh-1')),
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(makeWarehouseMember(), { status: 201 });
        },
      ),
    );
    const { user } = renderHarness();
    await user.click(screen.getByRole('button', { name: 'open add' }));

    await pickPerson(
      user,
      new RegExp(tt('warehouses.members.userId')),
      /Sara Ali/,
    );
    await user.click(
      screen.getByRole('combobox', {
        name: new RegExp(tt('warehouses.members.role')),
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: tt('warehouses.members.roles.STOCK_CONTROLLER'),
      }),
    );
    await user.click(
      screen.getByRole('button', { name: tt('warehouses.members.addSubmit') }),
    );

    await waitFor(() => {
      expect(body).toEqual({ userId: VALID_UUID, role: 'STOCK_CONTROLLER' });
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  it('closes on Escape', async () => {
    const { user } = renderHarness();
    await user.click(screen.getByRole('button', { name: 'open add' }));
    await screen.findByRole('dialog');

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('keeps submit disabled until a user and a role are chosen', async () => {
    const { user } = renderHarness();
    await user.click(screen.getByRole('button', { name: 'open add' }));
    const submit = await screen.findByRole('button', {
      name: tt('warehouses.members.addSubmit'),
    });
    expect(submit).toBeDisabled();

    await pickPerson(
      user,
      new RegExp(tt('warehouses.members.userId')),
      /Sara Ali/,
    );
    await user.click(
      screen.getByRole('combobox', {
        name: new RegExp(tt('warehouses.members.role')),
      }),
    );
    await user.click(
      await screen.findByRole('option', {
        name: tt('warehouses.members.roles.STOCK_CONTROLLER'),
      }),
    );

    await waitFor(() => {
      expect(submit).toBeEnabled();
    });
  });

  it('renders the Arabic dialog title when the language is ar', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/warehouses');
    const { user } = renderHarness();
    await user.click(screen.getByRole('button', { name: 'open add' }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'إضافة عضو' }),
    ).toBeInTheDocument();
  });
});
