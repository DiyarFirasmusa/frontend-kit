import { useTranslation } from 'react-i18next';
import { DialogFormGrid } from '@/components/dialog/dialog-form-grid';
import { FormDialog } from '@/components/dialog/form-dialog';
import { PersonSelectField } from '@/components/fields/person-select-field';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Warehouse } from '@/lib/icons';
import {
  useWarehouseFormDialog,
  type WarehouseDialogState,
} from '../../hooks/form/use-warehouse-form-dialog';

export interface WarehouseFormDialogProps {
  /** Render with `key` = mode + id so each opening starts clean. */
  mode: Exclude<WarehouseDialogState, { kind: 'closed' }>;
  onClose: () => void;
}

export function WarehouseFormDialog({
  mode,
  onClose,
}: WarehouseFormDialogProps) {
  const { t } = useTranslation();
  const dialog = useWarehouseFormDialog(mode, onClose);
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
            ? t('warehouses.dialog.editTitle')
            : t('warehouses.dialog.createTitle')
        }
        description={t('warehouses.dialog.description')}
        icon={<Warehouse className="size-5" />}
        size="md"
        isPending={dialog.isPending}
        canSubmit={!dialog.isLoading && !dialog.loadFailed}
        submitLabel={t('warehouses.dialog.save')}
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
          <DialogFormGrid>
            <TextField
              control={control}
              name="code"
              label={t('warehouses.dialog.code')}
              placeholder={t('warehouses.dialog.codePlaceholder')}
              dir="ltr"
              maxLength={30}
              disabled={dialog.isEditing}
              required
            />
            <TextField
              control={control}
              name="name"
              label={t('warehouses.dialog.name')}
              placeholder={t('warehouses.dialog.namePlaceholder')}
              maxLength={200}
              required
            />
            <TextField
              control={control}
              name="address"
              label={t('warehouses.dialog.address')}
              placeholder={t('warehouses.dialog.addressPlaceholder')}
              maxLength={300}
              required
            />
            <PersonSelectField
              control={control}
              name="managerUserId"
              kind="USER"
              label={t('warehouses.dialog.managerUserId')}
              placeholder={t('warehouses.dialog.managerUserIdPlaceholder')}
            />
            <SwitchField
              control={control}
              name="isTransit"
              label={t('warehouses.dialog.isTransit')}
            />
            <SwitchField
              control={control}
              name="isActive"
              label={t('warehouses.dialog.isActive')}
            />
          </DialogFormGrid>
        )}
      </FormDialog>
    </Form>
  );
}
