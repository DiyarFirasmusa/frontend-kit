import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
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

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItemCategory(id),
    onSuccess: (_data, id) => {
      // Drop the deleted record's own queries first: refetching them would 404.
      qc.removeQueries({ queryKey: qk.categories.detail(id) });
      qc.removeQueries({ queryKey: qk.categories.attributes(id) });
      return qc.invalidateQueries({ queryKey: qk.categories.lists() });
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
