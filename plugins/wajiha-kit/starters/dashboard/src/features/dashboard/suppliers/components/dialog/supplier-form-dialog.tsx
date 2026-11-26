import { useTranslation } from 'react-i18next';
import { FormDialog } from '@/components/dialog/form-dialog';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { TextareaField } from '@/components/fields/textarea-field';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useSupplierFormDialog,
  type SupplierDialogState,
} from '../../hooks/form/use-supplier-form-dialog';

export interface SupplierFormDialogProps {
  /** Render with `key` = mode + id so each opening starts clean. */
  mode: Exclude<SupplierDialogState, { kind: 'closed' }>;
  onClose: () => void;
}

export function SupplierFormDialog({ mode, onClose }: SupplierFormDialogProps) {
  const { t } = useTranslation();
  const dialog = useSupplierFormDialog(mode, onClose);
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
            ? t('suppliers.dialog.editTitle')
            : t('suppliers.dialog.createTitle')
        }
        description={t('suppliers.dialog.description')}
        isPending={dialog.isPending}
        canSubmit={!dialog.isLoading && !dialog.loadFailed}
        submitLabel={t('suppliers.dialog.save')}
        cancelLabel={t('common.cancel')}
        onSubmit={dialog.submit}
      >
        {dialog.isLoading ? (
          <div
            className="grid gap-3 sm:grid-cols-2"
            aria-busy="true"
            aria-label={t('common.loading')}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : dialog.loadFailed ? (
          <p role="alert" className="text-b2 text-danger">
            {t('common.loadError')}
          </p>
        ) : (
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <TextField
              control={control}
              name="code"
              label={t('suppliers.dialog.code')}
              placeholder={t('suppliers.dialog.codePlaceholder')}
              dir="ltr"
              maxLength={30}
              required
            />
            <TextField
              control={control}
              name="name"
              label={t('suppliers.dialog.name')}
              placeholder={t('suppliers.dialog.namePlaceholder')}
              maxLength={255}
              required
            />
            <TextField
              control={control}
              name="contactName"
              label={t('suppliers.dialog.contactName')}
              placeholder={t('suppliers.dialog.contactNamePlaceholder')}
              maxLength={150}
            />
            <TextField
              control={control}
              name="phone"
              label={t('suppliers.dialog.phone')}
              placeholder={t('suppliers.dialog.phonePlaceholder')}
              dir="ltr"
              maxLength={50}
            />
            <TextField
              control={control}
              name="email"
              type="email"
              label={t('suppliers.dialog.email')}
              placeholder={t('suppliers.dialog.emailPlaceholder')}
              dir="ltr"
              maxLength={150}
            />
            <TextField
              control={control}
              name="taxNumber"
              label={t('suppliers.dialog.taxNumber')}
              placeholder={t('suppliers.dialog.taxNumberPlaceholder')}
              dir="ltr"
              maxLength={50}
            />
            <div className="sm:col-span-2">
              <TextareaField
                control={control}
                name="address"
                label={t('suppliers.dialog.address')}
                placeholder={t('suppliers.dialog.addressPlaceholder')}
                maxLength={500}
                rows={2}
              />
            </div>
            <div className="sm:col-span-2">
              <TextareaField
                control={control}
                name="notes"
                label={t('suppliers.dialog.notes')}
                placeholder={t('suppliers.dialog.notesPlaceholder')}
                maxLength={2000}
                rows={2}
              />
            </div>
            <SwitchField
              control={control}
              name="isActive"
              label={t('suppliers.dialog.isActive')}
            />
          </div>
        )}
      </FormDialog>
    </Form>
  );
}
