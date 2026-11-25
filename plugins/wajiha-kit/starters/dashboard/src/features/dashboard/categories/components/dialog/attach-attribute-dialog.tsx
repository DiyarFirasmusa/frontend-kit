import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormDialog } from '@/components/dialog/form-dialog';
import { SelectField } from '@/components/fields/select-field';
import type { SelectOption } from '@/components/fields/select-option';
import { SwitchField } from '@/components/fields/switch-field';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import {
  attachAttributeSchema,
  defaultAttachAttributeForm,
  type AttachAttributeFormValues,
} from '../../validations/validations';

export interface AttachAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributeOptions: SelectOption[];
  isPending: boolean;
  onSubmit: (values: AttachAttributeFormValues) => void;
}

export function AttachAttributeDialog({
  open,
  onOpenChange,
  attributeOptions,
  isPending,
  onSubmit,
}: AttachAttributeDialogProps) {
  const { t } = useTranslation();
  const form = useForm<AttachAttributeFormValues>({
    resolver: zodResolver(attachAttributeSchema),
    defaultValues: defaultAttachAttributeForm,
  });
  const { control, reset } = form;
  const hasOptions = attributeOptions.length > 0;

  useEffect(() => {
    if (open) {
      reset(defaultAttachAttributeForm);
    }
  }, [open, reset]);

  return (
    <Form {...form}>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t('categories.attach.title')}
        description={t('categories.attach.description')}
        size="sm"
        isPending={isPending}
        canSubmit={hasOptions}
        submitLabel={t('categories.attach.submit')}
        onSubmit={() => {
          void form.handleSubmit(onSubmit)();
        }}
      >
        <div className="gap-row flex flex-col">
          {hasOptions ? (
            <SelectField
              control={control}
              name="attributeDefinitionId"
              label={t('categories.attach.attribute')}
              placeholder={t('categories.attach.attributePlaceholder')}
              options={attributeOptions}
              required
            />
          ) : (
            <p className="text-b2 text-text-secondary">
              {t('categories.attach.noAvailable')}
            </p>
          )}
          <SwitchField
            control={control}
            name="isRequired"
            label={t('categories.attach.isRequired')}
          />
          <SwitchField
            control={control}
            name="isVariantAxis"
            label={t('categories.attach.isVariantAxis')}
          />
        </div>
      </FormDialog>
    </Form>
  );
}
