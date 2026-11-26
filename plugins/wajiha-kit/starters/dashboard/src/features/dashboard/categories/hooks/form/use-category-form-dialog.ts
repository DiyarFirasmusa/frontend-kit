import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { applyApiFieldErrors } from '@/api/error/field-errors';
import type { SelectOption } from '@/components/fields/select-option';
import { useSingleFlight } from '@/hooks/use-single-flight';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import type { CategoryRow } from '../../types/types';
import { getCategoryPath, getDescendantIds } from '../../utils/category-tree';
import {
  CATEGORY_FORM_FIELDS,
  categorySchema,
  defaultCategoryForm,
  toCategoryFormValues,
  toCategoryPayload,
  type CategoryFormValues,
} from '../../validations/validations';
import { useCategoryDetail } from '../query/use-category-detail';
import {
  useCreateCategory,
  useUpdateCategory,
} from '../query/use-category-mutations';

/** Which dialog of the categories page is open: one union, never booleans. */
export type CategoryDialogState =
  | { kind: 'closed' }
  | { kind: 'create'; parentId: string }
  | { kind: 'edit'; categoryId: string }
  | { kind: 'move'; categoryId: string }
  | { kind: 'attach' }
  | { kind: 'options'; attributeId: string }
  | { kind: 'blocked'; categoryId: string };

export type CategoryFormMode = Extract<
  CategoryDialogState,
  { kind: 'create' | 'edit' | 'move' }
>;

/**
 * The create / edit / move form. Mounted per opening (keyed by mode and id),
 * so each opening starts clean. Edit and move load the record by id and fill
 * the form when it arrives; submit stays off until then. `categories` is the
 * whole tree, for the parent choices.
 */
export function useCategoryFormDialog(
  mode: CategoryFormMode,
  categories: CategoryRow[],
  onDone: (savedId: string) => void,
) {
  const { t } = useTranslation();
  const editId = mode.kind === 'create' ? null : mode.categoryId;
  const detail = useCategoryDetail(editId);
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      ...defaultCategoryForm,
      parentId: mode.kind === 'create' ? mode.parentId : '',
    },
    // `values` resets the form once when the record arrives.
    values: detail.data ? toCategoryFormValues(detail.data) : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const flight = useSingleFlight();
  const isPending = create.isPending || update.isPending;
  const isLoading = editId !== null && detail.isPending;

  const parentOptions = useMemo<SelectOption[]>(() => {
    // A category cannot move under itself or one of its own descendants.
    const excluded =
      editId === null
        ? new Set<string>()
        : new Set([editId, ...getDescendantIds(editId, categories)]);
    return [
      { value: '', label: t('categories.form.noParent') },
      ...categories
        .filter((category) => !excluded.has(category.id))
        .map((category) => ({
          value: category.id,
          label: getCategoryPath(category.id, categories),
        })),
    ];
  }, [editId, categories, t]);

  const onError = (error: unknown) => {
    // The client already toasted the summary; put field messages under the inputs.
    applyApiFieldErrors(error, form.setError, CATEGORY_FORM_FIELDS);
  };

  const onSuccess = (saved: CategoryRow) => {
    onDone(saved.id);
  };

  const submit = form.handleSubmit((values) => {
    // Enter or a double click while a request is in flight sends nothing. The
    // ref flips at once; `isPending` only after the next render.
    if (isLoading || !flight.start()) {
      return;
    }
    const settle = { onSettled: flight.end };
    if (editId !== null) {
      const payload = toCategoryPayload(values, detail.data?.expiryAlertDays);
      update.mutate({ id: editId, payload }, { onSuccess, onError, ...settle });
      return;
    }
    create.mutate(toCategoryPayload(values, null), {
      onSuccess,
      onError,
      ...settle,
    });
  });

  return {
    form,
    mode: mode.kind,
    hasCode: Boolean(detail.data?.code),
    isLoading,
    isPending,
    loadFailed: detail.isError,
    parentOptions,
    submit: () => {
      void submit();
    },
  };
}
