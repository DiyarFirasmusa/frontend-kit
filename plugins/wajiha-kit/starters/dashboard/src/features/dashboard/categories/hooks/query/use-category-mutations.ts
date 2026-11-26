import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { forgetQueries } from '@/lib/forget-queries';
import type { CategoryAttributeRequest } from '@/types/api/catalog';
import {
  attachCategoryAttribute,
  createItemCategory,
  deleteItemCategory,
  detachCategoryAttribute,
  updateCategoryAttribute,
  updateItemCategory,
} from '../../services/categories.service';
import type { CategoryPayload } from '../../types/types';

// Returning the promise keeps `isPending` true until the data has refetched,
// so a dialog closes on fresh data and a second click cannot slip in.
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => createItemCategory(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: CategoryPayload }) =>
      updateItemCategory(vars.id, vars.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories.all }),
  });
}

/**
 * `onDeleted` runs before the lists refetch: the page moves its selection off
 * the deleted record there. The assignments table still watches that record's
 * attributes, so they are cancelled, never removed (see `forgetQueries`).
 */
export function useDeleteCategory(onDeleted?: (id: string) => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItemCategory(id),
    onSuccess: async (_data, id) => {
      await forgetQueries(qc, [
        qk.categories.detail(id),
        qk.categories.attributes(id),
      ]);
      onDeleted?.(id);
      await qc.invalidateQueries({ queryKey: qk.categories.lists() });
    },
  });
}

export function useAttachCategoryAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryAttributeRequest) =>
      attachCategoryAttribute(categoryId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories.all }),
  });
}

export function useUpdateCategoryAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      assignmentId: string;
      payload: CategoryAttributeRequest;
    }) => updateCategoryAttribute(categoryId, vars.assignmentId, vars.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories.all }),
  });
}

export function useDetachCategoryAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) =>
      detachCategoryAttribute(categoryId, assignmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories.all }),
  });
}
