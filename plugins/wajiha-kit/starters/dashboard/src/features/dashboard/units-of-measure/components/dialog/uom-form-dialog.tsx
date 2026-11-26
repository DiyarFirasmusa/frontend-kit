import { useTranslation } from 'react-i18next';
import { FormDialog } from '@/components/dialog/form-dialog';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useUnitOfMeasureFormDialog,
  type UnitOfMeasureDialogState,
} from '../../hooks/form/use-uom-form-dialog';

export interface UnitOfMeasureFormDialogProps {
  /** Render with `key` = mode + id so each opening starts clean. */
  mode: Exclude<UnitOfMeasureDialogState, { kind: 'closed' }>;
  onClose: () => void;
}

export function UnitOfMeasureFormDialog({
  mode,
  onClose,
}: UnitOfMeasureFormDialogProps) {
  const { t } = useTranslation();
  const dialog = useUnitOfMeasureFormDialog(mode, onClose);
  const { control } = dialog.form;

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
            ? t('unitsOfMeasure.dialog.editTitle')
            : t('unitsOfMeasure.dialog.createTitle')
        }
        description={t('unitsOfMeasure.dialog.description')}
        size="sm"
        isPending={dialog.isPending}
        canSubmit={!dialog.isLoading && !dialog.loadFailed}
        submitLabel={t('unitsOfMeasure.dialog.save')}
        cancelLabel={t('common.cancel')}
        onSubmit={dialog.submit}
      >
        {dialog.isLoading ? (
          <div
            className="gap-row flex flex-col"
            aria-busy="true"
            aria-label={t('common.loading')}
          >
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : dialog.loadFailed ? (
          <p role="alert" className="text-b2 text-danger">
            {t('common.loadError')}
          </p>
        ) : (
          <div className="gap-row flex flex-col">
            <TextField
              control={control}
              name="code"
              label={t('unitsOfMeasure.dialog.code')}
              placeholder={t('unitsOfMeasure.dialog.codePlaceholder')}
              dir="ltr"
              maxLength={20}
              required
            />
            <TextField
              control={control}
              name="name"
              label={t('unitsOfMeasure.dialog.name')}
              placeholder={t('unitsOfMeasure.dialog.namePlaceholder')}
              maxLength={100}
              required
            />
            <TextField
              control={control}
              name="decimalPlaces"
              label={t('unitsOfMeasure.dialog.decimalPlaces')}
              placeholder={t('unitsOfMeasure.dialog.decimalPlacesPlaceholder')}
              format="digits"
              dir="ltr"
              required
            />
            <div className="border-stroke pb-row border-b">
              <SwitchField
                control={control}
                name="isActive"
                label={t('unitsOfMeasure.dialog.isActive')}
              />
            </div>
          </div>
        )}
      </FormDialog>
    </Form>
  );
}
