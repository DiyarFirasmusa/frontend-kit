import { useTranslation } from 'react-i18next';
import { FormDialog } from '@/components/dialog/form-dialog';
import { PersonSelectField } from '@/components/fields/person-select-field';
import { SelectField } from '@/components/fields/select-field';
import { Form } from '@/components/ui/form';
import type { AddMemberFormState } from '../hooks/form/use-add-member-form';
import { memberRoleOptions } from '../utils/member-role';

interface AddMemberDialogProps {
  dialog: AddMemberFormState;
}

export function AddMemberDialog({ dialog }: AddMemberDialogProps) {
  const { t } = useTranslation();

  return (
    <Form {...dialog.form}>
      <FormDialog
        open={dialog.open}
        onOpenChange={dialog.onOpenChange}
        title={t('warehouses.members.addTitle')}
        description={t('warehouses.members.addDescription')}
        size="sm"
        onSubmit={(event) => {
          void dialog.onSubmit(event);
        }}
        isPending={dialog.isPending}
        canSubmit={dialog.canSubmit}
        submitLabel={t('warehouses.members.addSubmit')}
      >
        <PersonSelectField
          control={dialog.form.control}
          name="userId"
          kind="USER"
          label={t('warehouses.members.userId')}
          placeholder={t('warehouses.members.userIdPlaceholder')}
          required
        />
        <SelectField
          control={dialog.form.control}
          placeholder={t('warehouses.members.rolePlaceholder')}
          name="role"
          label={t('warehouses.members.role')}
          options={memberRoleOptions(t)}
          required
        />
      </FormDialog>
    </Form>
  );
}
