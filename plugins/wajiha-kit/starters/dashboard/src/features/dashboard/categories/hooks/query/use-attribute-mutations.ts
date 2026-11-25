import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import type { AttributeDefinitionRequest } from '@/types/api/catalog';
import {
  createAttributeDefinition,
  deleteAttributeDefinition,
  saveAttributeOptions,
  updateAttributeDefinition,
} from '../../services/attributes.service';
import type { OptionChanges } from '../../utils/option-order';

function invalidateAttributeData(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: qk.attributes.all });
  void qc.invalidateQueries({ queryKey: qk.categories.all });
}

export function useCreateAttributeDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AttributeDefinitionRequest) =>
      createAttributeDefinition(payload),
    onSuccess: () => {
      invalidateAttributeData(qc);
    },
  });
}

export function useUpdateAttributeDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: AttributeDefinitionRequest }) =>
      updateAttributeDefinition(vars.id, vars.payload),
    onSuccess: () => {
      invalidateAttributeData(qc);
    },
  });
}

export function useDeleteAttributeDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttributeDefinition(id),
    onSuccess: () => {
      invalidateAttributeData(qc);
    },
  });
}

export function useSaveAttributeOptions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { definitionId: string; changes: OptionChanges }) =>
      saveAttributeOptions(vars.definitionId, vars.changes),
    // Refresh on failure too: earlier requests of the batch may have been saved.
    onSettled: () => {
      invalidateAttributeData(qc);
    },
  });
}
