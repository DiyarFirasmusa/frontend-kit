import { useTranslation } from 'react-i18next';
import { FormDialog } from '@/components/dialog/form-dialog';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { Form } from '@/components/ui/form';
import type { UnitOfMeasureFormDialogState } from '../../hooks/form/use-uom-form-dialog';

interface UnitOfMeasureFormDialogProps {
  dialog: UnitOfMeasureFormDialogState;
}

export function UnitOfMeasureFormDialog({
  dialog,
}: UnitOfMeasureFormDialogProps) {
  const { t } = useTranslation();
  const { control } = dialog.form;

  return (
    <Form {...dialog.form}>
      <FormDialog
        open={dialog.open}
        onOpenChange={dialog.onOpenChange}
        title={
          dialog.isEditing
            ? t('unitsOfMeasure.form.editTitle')
            : t('unitsOfMeasure.form.createTitle')
        }
        size="sm"
        isPending={dialog.isPending}
        canSubmit={dialog.canSubmit}
        submitLabel={t('unitsOfMeasure.form.submit')}
        onSubmit={(event) => {
          void dialog.onSubmit(event);
        }}
      >
        <div className="gap-row flex flex-col">
          <TextField
            control={control}
            name="code"
            label={t('unitsOfMeasure.form.code')}
            placeholder={t('unitsOfMeasure.form.codePlaceholder')}
            dir="ltr"
            maxLength={20}
            required
          />
          <TextField
            control={control}
            placeholder={t('unitsOfMeasure.form.namePlaceholder')}
            name="name"
            label={t('unitsOfMeasure.form.name')}
            maxLength={100}
            required
          />
          <TextField
            control={control}
            placeholder={t('unitsOfMeasure.form.decimalPlacesPlaceholder')}
            name="decimalPlaces"
            label={t('unitsOfMeasure.form.decimalPlaces')}
            format="digits"
            dir="ltr"
            required
          />
          <div className="border-stroke pb-row border-b">
            <SwitchField
              control={control}
              name="isActive"
              label={t('unitsOfMeasure.form.active')}
            />
          </div>
        </div>
      </FormDialog>
    </Form>
  );
}
