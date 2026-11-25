import type { UseQueryResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { qk } from '@/constants/query-keys';
import type {
  CategoryAttributeRequest,
  CategoryAttributeResponse,
  ItemCategoryResponse,
} from '@/types/api/catalog';
import type { AssignmentRow } from '../types/types';
import { getCategoryName } from '../utils/category-tree';
import { useCategoryAttributes } from './query/use-category-attributes';
import {
  useAttachCategoryAttribute,
  useDetachCategoryAttribute,
  useUpdateCategoryAttribute,
} from './query/use-category-mutations';

export interface CategoryAssignmentsView {
  query: UseQueryResult<CategoryAttributeResponse[]>;
  rows: AssignmentRow[];
  setRequired(row: AssignmentRow, value: boolean): void;
  setVariantAxis(row: AssignmentRow, value: boolean): void;
  attach(payload: CategoryAttributeRequest, onSuccess?: () => void): void;
  isAttaching: boolean;
  detach(assignmentId: string): void;
  isDetaching: boolean;
  isUpdating: boolean;
}

interface PendingFlags {
  isRequired: boolean;
  isVariantAxis: boolean;
  token: object;
}

export function useCategoryAssignments({
  categoryId,
  categories,
}: {
  categoryId: string | null;
  categories: ItemCategoryResponse[];
}): CategoryAssignmentsView {
  const qc = useQueryClient();
  const query = useCategoryAttributes(categoryId);
  const attachMutation = useAttachCategoryAttribute(categoryId ?? '');
  const updateMutation = useUpdateCategoryAttribute(categoryId ?? '');
  const detachMutation = useDetachCategoryAttribute(categoryId ?? '');
  const [pending] = useState(() => new Map<string, PendingFlags>());
  const [inFlight, setInFlight] = useState(0);

  const rows = useMemo<AssignmentRow[]>(
    () =>
      (query.data ?? []).map((row) => ({
        ...row,
        sourceName:
          row.sourceCategoryName?.trim() ||
          getCategoryName(
            row.inherited ? row.sourceCategoryId : categoryId,
            categories,
          ),
      })),
    [query.data, categories, categoryId],
  );

  function update(
    row: AssignmentRow,
    overrides: { isRequired?: boolean; isVariantAxis?: boolean },
  ) {
    if (row.inherited || row.attributeDefinitionId === null) {
      return;
    }
    const attributeDefinitionId = row.attributeDefinitionId;
    const queryKey = qk.categories.attributes(categoryId ?? '');
    const cached = qc
      .getQueryData<CategoryAttributeResponse[]>(queryKey)
      ?.find((item) => item.id === row.id);
    const source = cached ?? row;
    const inFlightFlags = pending.get(row.id);
    const base = inFlightFlags ?? {
      isRequired: source.isRequired ?? false,
      isVariantAxis: source.isVariantAxis ?? false,
    };
    const isRequired = overrides.isRequired ?? base.isRequired;
    const isVariantAxis = overrides.isVariantAxis ?? base.isVariantAxis;
    const sortOrder = source.sortOrder ?? 0;
    const token = {};
    pending.set(row.id, { isRequired, isVariantAxis, token });
    setInFlight((count) => count + 1);

    void (async () => {
      try {
        await updateMutation
          .mutateAsync({
            assignmentId: row.id,
            payload: {
              attributeDefinitionId,
              isRequired,
              isVariantAxis,
              sortOrder,
            },
          })
          .catch(() => null);
        await qc.invalidateQueries({ queryKey });
      } finally {
        if (pending.get(row.id)?.token === token) {
          pending.delete(row.id);
        }
        setInFlight((count) => count - 1);
      }
    })();
  }

  return {
    query,
    rows,
    setRequired(row, value) {
      update(row, { isRequired: value });
    },
    setVariantAxis(row, value) {
      update(row, { isVariantAxis: value });
    },
    attach(payload, onSuccess) {
      attachMutation.mutate(payload, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    },
    isAttaching: attachMutation.isPending,
    detach(assignmentId) {
      detachMutation.mutate(assignmentId);
    },
    isDetaching: detachMutation.isPending,
    isUpdating: inFlight > 0,
  };
}
