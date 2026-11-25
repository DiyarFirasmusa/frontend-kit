import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import type {
  CategoryAttributeRequest,
  ItemCategoryRequest,
} from '@/types/api/catalog';
import {
  attachCategoryAttribute,
  createItemCategory,
  deleteItemCategory,
  detachCategoryAttribute,
  updateCategoryAttribute,
  updateItemCategory,
} from '../../services/categories.service';

function invalidateCategoryMasterData(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: qk.categories.all });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ItemCategoryRequest) => createItemCategory(payload),
    onSuccess: () => {
      invalidateCategoryMasterData(qc);
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: ItemCategoryRequest }) =>
      updateItemCategory(vars.id, vars.payload),
    onSuccess: () => {
      invalidateCategoryMasterData(qc);
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItemCategory(id),
    onSuccess: () => {
      invalidateCategoryMasterData(qc);
    },
  });
}

export function useAttachCategoryAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryAttributeRequest) =>
      attachCategoryAttribute(categoryId, payload),
    onSuccess: () => {
      invalidateCategoryMasterData(qc);
    },
  });
}

export function useUpdateCategoryAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      assignmentId: string;
      payload: CategoryAttributeRequest;
    }) => updateCategoryAttribute(categoryId, vars.assignmentId, vars.payload),
    onSuccess: () => {
      invalidateCategoryMasterData(qc);
    },
  });
}

export function useDetachCategoryAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) =>
      detachCategoryAttribute(categoryId, assignmentId),
    onSuccess: () => {
      invalidateCategoryMasterData(qc);
    },
  });
}
