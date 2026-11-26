import { HttpResponse, http } from 'msw';
import { toast } from 'sonner';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor, within } from '@/test/render';
import { makeLocation, makeWarehouse } from '../../warehouse-test-utils';
import WarehouseDetailContainer from './index';

const detailUrl = api(endpoints.warehouses.detail('wh-1'));
const locationsUrl = api(endpoints.warehouses.locations('wh-1'));
const usersUrl = api(endpoints.warehouses.users('wh-1'));

describe('WarehouseDetailContainer delete', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  it.each(['overview', 'members', 'locations'] as const)(
    'deletes from the %s tab with one success toast and no request for the deleted record',
    async (tab) => {
      signIn({
        permissions: [
          PERMS.warehouse.view,
          PERMS.warehouse.update,
          PERMS.warehouse.delete,
        ],
      });
      const successToast = vi.spyOn(toast, 'success');
      const errorToast = vi.spyOn(toast, 'error');
      let deleted = false;
      const readsAfterDelete: string[] = [];
      const record = (path: string) => {
        if (deleted) {
          readsAfterDelete.push(path);
        }
      };
      server.use(
        http.get(detailUrl, () => {
          record('detail');
          return deleted
            ? HttpResponse.json(
                { message: 'Record not found' },
                { status: 404 },
              )
            : HttpResponse.json(makeWarehouse());
        }),
        http.get(locationsUrl, () => {
          record('locations');
          return HttpResponse.json([makeLocation()]);
        }),
        http.get(usersUrl, () => {
          record('users');
          return HttpResponse.json([]);
        }),
        http.get(api(endpoints.warehouses.list), () => HttpResponse.json([])),
        http.delete(api(endpoints.warehouses.remove('wh-1')), () => {
          deleted = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const { user, router } = await renderWithRouter(
        <WarehouseDetailContainer warehouseId="wh-1" tab={tab} />,
        { path: '/warehouses/wh-1' },
      );

      await user.click(
        await screen.findByRole('button', {
          name: tt('warehouses.actions.delete'),
        }),
      );
      // A destructive confirm is an alert dialog (components/dialog/confirm-dialog).
      const dialog = await screen.findByRole('alertdialog');
      await user.click(
        within(dialog).getByRole('button', {
          name: tt('common.delete'),
        }),
      );

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/warehouses');
      });
      // Give any stray refetch the chance to happen before asserting none did.
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      expect(readsAfterDelete).toEqual([]);
      expect(errorToast).not.toHaveBeenCalled();
      expect(successToast).toHaveBeenCalledExactlyOnceWith(
        tt('warehouses.messages.deleted'),
      );
    },
  );
});
