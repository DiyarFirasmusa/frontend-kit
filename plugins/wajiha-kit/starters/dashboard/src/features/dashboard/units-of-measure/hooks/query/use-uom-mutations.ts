import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import {
  createUnitOfMeasure,
  deleteUnitOfMeasure,
  updateUnitOfMeasure,
} from '../../services/units-of-measure.service';
import type { UnitOfMeasurePayload } from '../../types/types';

export function useCreateUnitOfMeasure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UnitOfMeasurePayload) => createUnitOfMeasure(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.unitsOfMeasure.all });
    },
  });
}

export function useUpdateUnitOfMeasure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: UnitOfMeasurePayload }) =>
      updateUnitOfMeasure(vars.id, vars.payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.unitsOfMeasure.all });
    },
  });
}

export function useDeleteUnitOfMeasure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUnitOfMeasure(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.unitsOfMeasure.all });
    },
  });
}
