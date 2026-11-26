import { beforeEach, describe, expect, it } from 'vitest';
import { PERMS } from '@/constants/permissions';
import { warehouseHandlers } from '@/mocks/handlers/warehouses';
import { resetMockDb } from '@/mocks/seed/base';
import { warehouseId } from '@/mocks/seed/warehouses';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { server } from '@/test/msw/server';
import { screen, waitFor, within } from '@/test/render';
import { renderApp } from '@/test/render-app';

const WAIT = { timeout: 5000 };
const FIRST = warehouseId(0);

async function openDetail(path: string) {
  signIn({
    roles: [],
    permissions: [
      PERMS.warehouse.view,
      PERMS.warehouse.update,
      PERMS.warehouse.delete,
    ],
  });
  return renderApp(path);
}

describe('warehouse detail (real route, shared mock backend)', () => {
  beforeEach(() => {
    resetMockDb();
    server.use(...warehouseHandlers);
  });

  it('opens the tab named in the URL and writes the tab back when it changes', async () => {
    const { user, router } = await openDetail(
      `/warehouses/${FIRST}?tab=locations`,
    );
    expect(
      await screen.findByRole(
        'heading',
        {
          level: 2,
          name: tt('warehouses.locations.title'),
        },
        WAIT,
      ),
    ).toBeVisible();

    await user.click(
      screen.getByRole('tab', { name: tt('warehouses.detail.tabs.members') }),
    );
    expect(
      await screen.findByRole(
        'heading',
        {
          level: 2,
          name: tt('warehouses.members.title'),
        },
        WAIT,
      ),
    ).toBeVisible();
    expect(router.state.location.search).toEqual({ tab: 'members' });

    // The default tab leaves the URL.
    await user.click(
      screen.getByRole('tab', { name: tt('warehouses.detail.tabs.overview') }),
    );
    await waitFor(() => {
      expect(router.state.location.search).toEqual({});
    });
  });

  it('falls back to the overview for an unknown tab', async () => {
    const { router } = await openDetail(`/warehouses/${FIRST}?tab=billing`);
    expect(
      await screen.findByRole(
        'region',
        {
          name: tt('warehouses.detail.tabs.overview'),
        },
        WAIT,
      ),
    ).toBeVisible();
    expect(router.state.location.search).toEqual({});
  });

  it('edits through the one dialog, loaded by id, and shows the new name', async () => {
    const { user } = await openDetail(`/warehouses/${FIRST}`);
    const edit = await screen.findByRole(
      'button',
      { name: tt('warehouses.actions.edit') },
      WAIT,
    );
    await user.click(edit);
    const dialog = await screen.findByRole('dialog');
    const name = within(dialog).getByLabelText(/^Name/);
    await waitFor(() => {
      expect(name).not.toHaveValue('');
    }, WAIT);
    await user.clear(name);
    await user.type(name, 'Renamed hub');
    await user.click(
      within(dialog).getByRole('button', {
        name: tt('warehouses.dialog.save'),
      }),
    );
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: 'Renamed hub' },
        WAIT,
      ),
    ).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('shows the not-found card for an unknown id', async () => {
    await openDetail('/warehouses/wh-404');
    expect(
      await screen.findByRole(
        'heading',
        {
          level: 1,
          name: tt('errorPages.states.notFound.title'),
        },
        WAIT,
      ),
    ).toBeVisible();
  });
});
