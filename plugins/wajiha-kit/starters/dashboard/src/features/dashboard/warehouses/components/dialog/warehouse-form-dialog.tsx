import { useTranslation } from 'react-i18next';
import { DialogFormGrid } from '@/components/dialog/dialog-form-grid';
import { FormDialog } from '@/components/dialog/form-dialog';
import { PersonSelectField } from '@/components/fields/person-select-field';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { Form } from '@/components/ui/form';
import { Warehouse } from '@/lib/icons';
import type { WarehouseFormDialogState } from '../../hooks/form/use-warehouse-form-dialog';

interface WarehouseFormDialogProps {
  dialog: WarehouseFormDialogState;
}

export function WarehouseFormDialog({ dialog }: WarehouseFormDialogProps) {
  const { t } = useTranslation();
  const { control } = dialog.form;

  return (
    <Form {...dialog.form}>
      <FormDialog
        open={dialog.open}
        onOpenChange={dialog.onOpenChange}
        title={
          dialog.isEditing
            ? t('warehouses.form.editTitle')
            : t('warehouses.form.createTitle')
        }
        description={t('warehouses.form.description')}
        icon={<Warehouse className="size-5" />}
        size="md"
        isPending={dialog.isPending}
        canSubmit={dialog.canSubmit}
        submitLabel={t('warehouses.form.submit')}
        onSubmit={(event) => {
          void dialog.onSubmit(event);
        }}
      >
        <DialogFormGrid>
          <TextField
            control={control}
            name="code"
            label={t('warehouses.form.code')}
            placeholder={t('warehouses.form.codePlaceholder')}
            dir="ltr"
            maxLength={30}
            disabled={dialog.isEditing}
            required
          />
          <TextField
            control={control}
            name="name"
            label={t('warehouses.form.name')}
            placeholder={t('warehouses.form.namePlaceholder')}
            maxLength={200}
            required
          />
          <TextField
            control={control}
            name="address"
            label={t('warehouses.form.address')}
            placeholder={t('warehouses.form.addressPlaceholder')}
            maxLength={300}
            required
          />
          <PersonSelectField
            control={control}
            name="managerUserId"
            kind="USER"
            label={t('warehouses.form.managerUserId')}
            placeholder={t('warehouses.form.managerUserIdPlaceholder')}
          />
          <SwitchField
            control={control}
            name="isTransit"
            label={t('warehouses.form.isTransit')}
          />
          <SwitchField
            control={control}
            name="isActive"
            label={t('warehouses.form.isActive')}
          />
        </DialogFormGrid>
      </FormDialog>
    </Form>
  );
}
