import { useTranslation } from 'react-i18next';
import { DialogFormGrid } from '@/components/dialog/dialog-form-grid';
import { FormDialog } from '@/components/dialog/form-dialog';
import { ComboboxField } from '@/components/fields/combobox-field';
import { NumberField } from '@/components/fields/number-field';
import { SelectField } from '@/components/fields/select-field';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCategoryFormDialog,
  type CategoryFormMode,
} from '../../hooks/form/use-category-form-dialog';
import type { CategoryRow } from '../../types/types';

const COMBOBOX_THRESHOLD = 8;

export interface CategoryFormDialogProps {
  /** Render with `key` = mode + id so each opening starts clean. */
  mode: CategoryFormMode;
  /** The whole tree, for the parent choices. */
  categories: CategoryRow[];
  onClose: () => void;
  /** Called with the saved category's id once the request succeeded. */
  onSaved: (id: string) => void;
}

export function CategoryFormDialog({
  mode,
  categories,
  onClose,
  onSaved,
}: CategoryFormDialogProps) {
  const { t } = useTranslation();
  const dialog = useCategoryFormDialog(mode, categories, onSaved);
  const { control } = dialog.form;
  const isMove = mode.kind === 'move';

  const title =
    mode.kind === 'edit'
      ? t('categories.form.editTitle')
      : isMove
        ? t('categories.form.moveTitle')
        : t('categories.form.createTitle');
  const description = isMove
    ? `${t('categories.form.description')} ${t('categories.form.moveDescription')}`
    : t('categories.form.description');

  const parentField =
    dialog.parentOptions.length > COMBOBOX_THRESHOLD ? (
      <ComboboxField
        control={control}
        name="parentId"
        label={t('categories.form.parent')}
        options={dialog.parentOptions}
      />
    ) : (
      <SelectField
        control={control}
        name="parentId"
        label={t('categories.form.parent')}
        options={dialog.parentOptions}
      />
    );

  return (
    <Form {...dialog.form}>
      <FormDialog
        open
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        title={title}
        description={description}
        size="md"
        isPending={dialog.isPending}
        canSubmit={!dialog.isLoading && !dialog.loadFailed}
        submitLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        onSubmit={dialog.submit}
      >
        {dialog.isLoading ? (
          <div
            className="grid gap-3 sm:grid-cols-2"
            aria-busy="true"
            aria-label={t('common.loading')}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : dialog.loadFailed ? (
          <p role="alert" className="text-b2 text-danger">
            {t('common.loadError')}
          </p>
        ) : (
          <DialogFormGrid>
            {mode.kind === 'edit' && dialog.hasCode ? (
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
              required
            />
            <div className="col-span-full">{parentField}</div>
            {isMove ? null : (
              <div className="col-span-full">
                <NumberField
                  control={control}
                  name="expiryAlertDays"
                  label={t('categories.form.expiryAlertDays')}
                  min={1}
                  max={365}
                  integer
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
              />
            </div>
          </DialogFormGrid>
        )}
      </FormDialog>
    </Form>
  );
}
