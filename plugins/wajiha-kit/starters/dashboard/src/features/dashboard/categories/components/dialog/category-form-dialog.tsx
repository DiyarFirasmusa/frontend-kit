import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DialogFormGrid } from '@/components/dialog/dialog-form-grid';
import { FormDialog } from '@/components/dialog/form-dialog';
import { ComboboxField } from '@/components/fields/combobox-field';
import { NumberField } from '@/components/fields/number-field';
import { SelectField } from '@/components/fields/select-field';
import type { SelectOption } from '@/components/fields/select-option';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import type { ItemCategoryResponse } from '@/types/api/catalog';
import type { CategoryFormMode } from '../../hooks/form/use-category-form-dialog';
import {
  categorySchema,
  defaultCategoryForm,
  type CategoryFormValues,
} from '../../validations/validations';

const COMBOBOX_THRESHOLD = 8;

export interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CategoryFormMode;
  category: ItemCategoryResponse | null;
  defaultParentId: string;
  parentOptions: SelectOption[];
  isPending: boolean;
  onSubmit: (values: CategoryFormValues) => void;
}

function toFormValues(
  mode: CategoryFormMode,
  category: ItemCategoryResponse | null,
  defaultParentId: string,
): CategoryFormValues {
  if (mode === 'create' || !category) {
    return { ...defaultCategoryForm, parentId: defaultParentId };
  }
  return {
    code: category.code ?? '',
    name: category.name ?? '',
    parentId: category.parentId ?? '',
    isActive: category.isActive ?? true,
    expiryAlertDays:
      typeof category.expiryAlertDays === 'number' &&
      category.expiryAlertDays > 0
        ? category.expiryAlertDays
        : undefined,
  };
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  category,
  defaultParentId,
  parentOptions,
  isPending,
  onSubmit,
}: CategoryFormDialogProps) {
  const { t } = useTranslation();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultCategoryForm,
  });
  const { control } = form;

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(mode, category, defaultParentId));
    }
  }, [open]);

  const title =
    mode === 'edit'
      ? t('categories.form.editTitle')
      : mode === 'move'
        ? t('categories.form.moveTitle')
        : t('categories.form.createTitle');
  const description =
    mode === 'move'
      ? `${t('categories.form.description')} ${t('categories.form.moveDescription')}`
      : t('categories.form.description');

  const parentField =
    parentOptions.length > COMBOBOX_THRESHOLD ? (
      <ComboboxField
        control={control}
        name="parentId"
        label={t('categories.form.parent')}
        options={parentOptions}
      />
    ) : (
      <SelectField
        control={control}
        name="parentId"
        label={t('categories.form.parent')}
        options={parentOptions}
      />
    );

  return (
    <Form {...form}>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        size="md"
        isPending={isPending}
        canSubmit={!isPending}
        submitLabel={t('common.save')}
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            onSubmit(values);
          })(event);
        }}
      >
        <DialogFormGrid>
          {mode === 'edit' && category?.code ? (
            <TextField
              control={control}
              name="code"
              label={t('categories.form.code')}
              dir="ltr"
              disabled
            />
          ) : null}
          <TextField
            control={control}
            name="name"
            label={t('categories.form.name')}
            placeholder={t('categories.form.namePlaceholder')}
            maxLength={200}
            disabled={isPending}
            required
          />
          <div className="col-span-full">{parentField}</div>
          {mode === 'move' ? null : (
            <div className="col-span-full">
              <NumberField
                control={control}
                name="expiryAlertDays"
                label={t('categories.form.expiryAlertDays')}
                min={1}
                max={365}
                integer
                disabled={isPending}
              />
              <p className="text-b3 text-text-secondary mt-1">
                {t('categories.form.expiryAlertDaysHint')}
              </p>
            </div>
          )}
          <div className="col-span-full">
            <SwitchField
              control={control}
              name="isActive"
              label={t('categories.form.isActive')}
              disabled={isPending}
            />
          </div>
        </DialogFormGrid>
      </FormDialog>
    </Form>
  );
}
