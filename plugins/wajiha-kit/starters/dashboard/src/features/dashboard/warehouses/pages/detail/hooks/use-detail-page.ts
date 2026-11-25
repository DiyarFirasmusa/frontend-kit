import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorStatus } from '@/api/error/api-error';
import { qk } from '@/constants/query-keys';
import { directionOf } from '@/lib/i18n/languages';
import { useWarehouseFormDialog } from '../../../hooks/form/use-warehouse-form-dialog';
import { useDeleteWarehouse } from '../../../hooks/query/use-warehouse-mutations';
import {
  canDeleteWarehouse,
  canEditWarehouse,
} from '../../../hooks/warehouse-actions';
import type { WarehouseDetailTab } from '../types/types';
import { useWarehouseDetails } from './query/use-warehouse-details';

export function useWarehouseDetailPage(
  warehouseId: string,
  tab: WarehouseDetailTab,
) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useWarehouseDetails(warehouseId);
  const remove = useDeleteWarehouse();
  const formDialog = useWarehouseFormDialog();
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const goToList = () => {
    void navigate({ to: '/warehouses' });
  };

  const goHome = () => {
    void navigate({ to: '/' });
  };

  const warehouse = query.data;
  const isNotFound = getErrorStatus(query.error) === 404;
  const subtitle =
    [warehouse?.code, warehouse?.address].filter(Boolean).join(' · ') || '—';

  return {
    dir: directionOf(i18n.language),
    tab,
    isNotFound,
    onHome: goHome,
    isTransit: warehouse?.isTransit === true,
    detailState: {
      isLoading: query.isLoading,
      // A 404 is a legitimate empty result, so it never reaches the error branch.
      isError: query.isError && !isNotFound,
      error: isNotFound ? undefined : query.error,
      data: query.data,
      onRetry: () => {
        void query.refetch();
      },
    },
    title: warehouse?.name || t('warehouses.detail.title'),
    subtitle,
    formDialog,
    canEdit: warehouse !== undefined && canEditWarehouse(),
    canDelete: warehouse !== undefined && canDeleteWarehouse(),
    onTabChange: (next: WarehouseDetailTab) => {
      void navigate({
        to: '/warehouses/$warehouseId',
        params: { warehouseId },
        search: { tab: next },
      });
    },
    onBack: goToList,
    onEdit: () => {
      if (warehouse) {
        formDialog.openEdit(warehouse);
      }
    },
    deleteDialog: {
      open: isDeleteOpen,
      name: warehouse?.name ?? '',
      isPending: remove.isPending,
      onOpen: () => {
        setDeleteOpen(true);
      },
      onOpenChange: setDeleteOpen,
      onConfirm: () => {
        remove.mutate(warehouseId, {
          onSuccess: () => {
            setDeleteOpen(false);
            const staleKeys = [
              qk.warehouses.detail(warehouseId),
              qk.warehouses.locations(warehouseId),
            ];
            for (const queryKey of staleKeys) {
              void queryClient.cancelQueries({ queryKey });
              queryClient.removeQueries({ queryKey });
            }
            goToList();
          },
        });
      },
    },
  };
}
