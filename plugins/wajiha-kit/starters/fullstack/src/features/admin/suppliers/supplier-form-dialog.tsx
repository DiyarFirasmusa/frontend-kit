import type { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormDialog } from '@/components/dialog/form-dialog';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { TextareaField } from '@/components/fields/textarea-field';
import type { SupplierValues } from './validations';

export type SupplierFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  control: Control<SupplierValues>;
  isPending: boolean;
  onSubmit: () => void;
};

export function SupplierFormDialog({
  open,
  onOpenChange,
  isEditing,
  control,
  isPending,
  onSubmit,
}: SupplierFormDialogProps) {
  const { t } = useTranslation();
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? t('suppliers.editTitle') : t('suppliers.createTitle')}
      description={t('suppliers.dialogDescription')}
      isPending={isPending}
      canSubmit={!isPending}
      submitLabel={t('ui.save')}
      cancelLabel={t('ui.cancel')}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="gap-row grid items-start sm:grid-cols-2">
        <TextField
          control={control}
          name="code"
          label={t('suppliers.fieldCode')}
          dir="ltr"
          maxLength={30}
          required
        />
        <TextField
          control={control}
          name="name"
          label={t('suppliers.fieldName')}
          maxLength={255}
          required
        />
        <TextField
          control={control}
          name="contactName"
          label={t('suppliers.fieldContact')}
          maxLength={150}
        />
        <TextField
          control={control}
          name="phone"
          type="tel"
          label={t('suppliers.fieldPhone')}
          dir="ltr"
          maxLength={50}
        />
        <div className="sm:col-span-2">
          <TextField
            control={control}
            name="email"
            type="email"
            label={t('suppliers.fieldEmail')}
            dir="ltr"
            maxLength={150}
          />
        </div>
        <div className="sm:col-span-2">
          <TextareaField
            control={control}
            name="notes"
            label={t('suppliers.fieldNotes')}
            maxLength={2000}
            rows={2}
          />
        </div>
        <SwitchField control={control} name="isActive" label={t('suppliers.fieldActive')} />
      </div>
    </FormDialog>
  );
}
