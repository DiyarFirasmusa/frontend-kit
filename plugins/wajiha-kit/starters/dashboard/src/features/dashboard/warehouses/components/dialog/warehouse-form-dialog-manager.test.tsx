import { HttpResponse, http } from 'msw';
import { useState } from 'react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import {
  serveDirectoryNames,
  serveDirectorySearch,
} from '@/test/msw/directory';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { pickPerson } from '@/test/pick-person';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import type { WarehouseDialogState } from '../../hooks/form/use-warehouse-form-dialog';
import { makeWarehouse } from '../../warehouse-test-utils';
import { WarehouseFormDialog } from './warehouse-form-dialog';

const MANAGER = '6f1d2c3a-0000-4000-8000-000000000001';

function Harness() {
  const [mode, setMode] = useState<WarehouseDialogState>({ kind: 'closed' });
  return (
    <>
      <Button
        onClick={() => {
          setMode({ kind: 'create' });
        }}
      >
        open create
      </Button>
      <Button
        onClick={() => {
          setMode({ kind: 'edit', warehouseId: 'wh-1' });
        }}
      >
        open edit
      </Button>
      {mode.kind === 'closed' ? null : (
        <WarehouseFormDialog
          key={mode.kind}
          mode={mode}
          onClose={() => {
            setMode({ kind: 'closed' });
          }}
        />
      )}
    </>
  );
}

function managerLabel(): RegExp {
  return new RegExp(tt('warehouses.dialog.managerUserId'));
}

describe('WarehouseFormDialog manager', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  beforeEach(() => {
    signIn({ permissions: [PERMS.warehouse.create, PERMS.warehouse.update] });
    // Edit loads the record by id.
    server.use(
      http.get(api(endpoints.warehouses.detail(':id')), () =>
        HttpResponse.json(makeWarehouse()),
      ),
    );
  });

  it('shows the resolved manager name when editing', async () => {
    serveDirectoryNames({ [MANAGER]: 'Sara Ali' });
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open edit' }));

    const trigger = await screen.findByRole('button', { name: managerLabel() });
    await waitFor(() => {
      expect(trigger).toHaveTextContent('Sara Ali');
    });
  });

  it('sends the picked user id as managerUserId on create', async () => {
    serveDirectorySearch([{ id: MANAGER, name: 'Sara Ali' }]);
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
      await screen.findByLabelText(new RegExp(tt('warehouses.dialog.name'))),
      'North depot',
    );
    await user.type(
      screen.getByLabelText(new RegExp(tt('warehouses.dialog.code'))),
      'WH-09',
    );
    await user.type(
      screen.getByLabelText(new RegExp(tt('warehouses.dialog.address'))),
      'Karbala',
    );
    await pickPerson(user, managerLabel(), /Sara Ali/);
    await user.click(
      screen.getByRole('button', { name: tt('warehouses.dialog.save') }),
    );

    await waitFor(() => {
      expect(body).toMatchObject({ managerUserId: MANAGER });
    });
  });
});
