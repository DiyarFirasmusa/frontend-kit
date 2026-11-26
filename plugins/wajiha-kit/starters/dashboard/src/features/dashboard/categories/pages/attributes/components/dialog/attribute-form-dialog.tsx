import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  DialogFormFullWidth,
  DialogFormGrid,
} from '@/components/dialog/dialog-form-grid';
import { FormDialog } from '@/components/dialog/form-dialog';
import { SelectField } from '@/components/fields/select-field';
import type { SelectOption } from '@/components/fields/select-option';
import { TextField } from '@/components/fields/text-field';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Bookmark } from '@/lib/icons';
import { AttributeDataTypeValues } from '@/types/api/enums';
import {
  useAttributeFormDialog,
  type AttributeDialogState,
} from '../../hooks/form/use-attribute-form-dialog';

const USAGE_TILES = ['required', 'variantAxis', 'options'] as const;

export interface AttributeFormDialogProps {
  /** Render with `key` = mode + id so each opening starts clean. */
  mode: Extract<AttributeDialogState, { kind: 'create' | 'edit' }>;
  onClose: () => void;
}

export function AttributeFormDialog({
  mode,
  onClose,
}: AttributeFormDialogProps) {
  const { t } = useTranslation();
  const dialog = useAttributeFormDialog(mode, onClose);
  const { control } = dialog.form;
  const dataType = useWatch({ control, name: 'dataType' });

  const dataTypeOptions: SelectOption[] = AttributeDataTypeValues.map(
    (value) => ({ value, label: t(`enums.AttributeDataType.${value}`) }),
  );
  const statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: t('categories.attributeForm.statusActive') },
    { value: 'INACTIVE', label: t('categories.attributeForm.statusInactive') },
  ];

  return (
    <Form {...dialog.form}>
      <FormDialog
        open
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        title={
          dialog.isEditing
            ? t('categories.attributeForm.editTitle')
            : t('categories.attributeForm.createTitle')
        }
        description={t('categories.attributeForm.description')}
        size="md"
        icon={<Bookmark className="size-5" />}
        submitLabel={t('categories.attributeForm.submit')}
        cancelLabel={t('common.cancel')}
        isPending={dialog.isPending}
        canSubmit={!dialog.isLoading && !dialog.loadFailed}
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
            <TextField
              control={control}
              name="name"
              label={t('categories.attributeForm.name')}
              placeholder={t('categories.attributeForm.namePlaceholder')}
              maxLength={100}
              required
            />
            <SelectField
              control={control}
              name="dataType"
              label={t('categories.attributeForm.dataType')}
              placeholder={t('categories.attributeForm.dataTypePlaceholder')}
              options={dataTypeOptions}
              required
            />
            {dialog.isEditing ? (
              <TextField
                control={control}
                name="code"
                label={t('categories.attributeForm.code')}
                dir="ltr"
                disabled
              />
            ) : null}
            {dataType === 'NUMBER' ? (
              <TextField
                control={control}
                name="unitLabel"
                label={t('categories.attributeForm.unitLabel')}
                placeholder={t('categories.attributeForm.unitLabelPlaceholder')}
                maxLength={20}
              />
            ) : null}
            <SelectField
              control={control}
              placeholder={t('categories.attributeForm.statusPlaceholder')}
              name="status"
              label={t('categories.attributeForm.status')}
              options={statusOptions}
              required
            />
            {!dialog.isEditing && dataType === 'OPTION' ? (
              <DialogFormFullWidth>
                <p className="text-b3 text-text-secondary">
                  {t('categories.attributeForm.optionsHint')}
                </p>
              </DialogFormFullWidth>
            ) : null}
            <DialogFormFullWidth>
              <div className="gap-field flex flex-col">
                <p className="text-h5 text-danger gap-field flex items-center">
                  <Bell className="size-4 shrink-0" aria-hidden />
                  {t('categories.attributeForm.usage.title')}
                </p>
                <p className="text-b2 text-text-secondary">
                  {t('categories.attributeForm.usageNote')}
                </p>
              </div>
            </DialogFormFullWidth>
            <DialogFormFullWidth>
              <dl className="gap-field grid grid-cols-3">
                {USAGE_TILES.map((tile) => (
                  <div
                    key={tile}
                    className="bg-hover-row p-row flex flex-col items-center gap-1 rounded-xl text-center"
                  >
                    <dt className="text-b3 text-text-secondary">
                      {t(`categories.attributeForm.usage.${tile}.label`)}
                    </dt>
                    <dd className="text-h4 text-text-primary">
                      {t(`categories.attributeForm.usage.${tile}.value`)}
                    </dd>
                  </div>
                ))}
              </dl>
            </DialogFormFullWidth>
          </DialogFormGrid>
        )}
      </FormDialog>
    </Form>
  );
}
