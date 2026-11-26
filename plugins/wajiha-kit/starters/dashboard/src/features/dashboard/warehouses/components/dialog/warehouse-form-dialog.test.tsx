import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { useWarehouseFormDialog } from '../../hooks/form/use-warehouse-form-dialog';
import { makeWarehouse } from '../../warehouse-test-utils';
import { WarehouseFormDialog } from './warehouse-form-dialog';

function Harness() {
  const dialog = useWarehouseFormDialog();
  return (
    <>
      <Button onClick={dialog.openCreate}>open create</Button>
      <Button
        onClick={() => {
          dialog.openEdit(makeWarehouse());
        }}
      >
        open edit
      </Button>
      <WarehouseFormDialog dialog={dialog} />
    </>
  );
}

describe('WarehouseFormDialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    signIn({ permissions: [PERMS.warehouse.create, PERMS.warehouse.update] });
  });

  it('shows the required-field message when the name is cleared', async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByRole('button', { name: 'open create' }));

    const name = await screen.findByLabelText(
      new RegExp(tt('warehouses.form.name')),
    );
    await user.type(name, 'x');
    await user.clear(name);

    expect(
      await screen.findByText(tt('warehouses.form.errors.name')),
    ).toBeInTheDocument();
  });

  it('shows the required-field message when the code is cleared', async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByRole('button', { name: 'open create' }));

    const code = await screen.findByLabelText(
      new RegExp(tt('warehouses.form.code')),
    );
    await user.type(code, 'x');
    await user.clear(code);

    expect(
      await screen.findByText(tt('warehouses.form.errors.code')),
    ).toBeInTheDocument();
  });

  it('POSTs the trimmed payload on create and closes', async () => {
    let body: unknown;
    server.use(
      http.post(api(endpoints.warehouses.create), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(makeWarehouse(), { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open create' }));
    await user.type(
      await screen.findByLabelText(new RegExp(tt('warehouses.form.name'))),
      '  North depot  ',
    );
    await user.type(
      screen.getByLabelText(new RegExp(tt('warehouses.form.code'))),
      'wh-09',
    );
    await user.type(
      screen.getByLabelText(new RegExp(tt('warehouses.form.address'))),
      '  Karbala, industrial zone ',
    );
    await user.click(
      screen.getByRole('button', { name: tt('warehouses.form.submit') }),
    );

    await waitFor(() => {
      expect(body).toEqual({
        name: 'North depot',
        code: 'wh-09',
        address: 'Karbala, industrial zone',
        isTransit: false,
        isActive: true,
      });
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('prefills the form and PUTs the full payload to the row id on edit', async () => {
    let url = '';
    let body: unknown;
    server.use(
      http.put(api(endpoints.warehouses.update(':id')), async ({ request }) => {
        url = request.url;
        body = await request.json();
        return HttpResponse.json(makeWarehouse());
      }),
    );
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open edit' }));
    expect(
      await screen.findByLabelText(new RegExp(tt('warehouses.form.name'))),
    ).toHaveValue('Baghdad central warehouse');
    await user.click(
      screen.getByRole('button', { name: tt('warehouses.form.submit') }),
    );

    await waitFor(() => {
      expect(url).toBe(api(endpoints.warehouses.update('wh-1')));
    });
    expect(body).toEqual({
      name: 'Baghdad central warehouse',
      code: 'BGD-01',
      address: 'Baghdad, industrial zone',
      managerUserId: '6f1d2c3a-0000-4000-8000-000000000001',
      isTransit: false,
      isActive: true,
    });
  });

  it('locks the code field while editing and keeps it editable on create', async () => {
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open create' }));
    expect(
      await screen.findByLabelText(new RegExp(tt('warehouses.form.code'))),
    ).toBeEnabled();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'open edit' }));
    expect(
      await screen.findByLabelText(new RegExp(tt('warehouses.form.code'))),
    ).toBeDisabled();
  });

  it('requires the address', async () => {
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open create' }));
    await user.type(
      await screen.findByLabelText(new RegExp(tt('warehouses.form.name'))),
      'North depot',
    );
    await user.type(
      screen.getByLabelText(new RegExp(tt('warehouses.form.code'))),
      'WH-09',
    );

    expect(
      screen.getByRole('button', { name: tt('warehouses.form.submit') }),
    ).toBeDisabled();
  });
});
