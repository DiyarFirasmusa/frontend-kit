import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Bell, Bookmark } from '@/lib/icons';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import { AttributeDataTypeValues } from '@/types/api/enums';
import {
  attributeDefinitionSchema,
  defaultAttributeDefinitionForm,
  type AttributeDefinitionFormValues,
} from '../../validations/validations';

const USAGE_TILES = ['required', 'variantAxis', 'options'] as const;

export interface AttributeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: AttributeDefinitionResponse | null;
  isPending: boolean;
  onSubmit: (values: AttributeDefinitionFormValues) => void;
}

function toFormValues(
  attribute: AttributeDefinitionResponse,
): AttributeDefinitionFormValues {
  return {
    code: attribute.code ?? '',
    name: attribute.name ?? '',
    dataType: attribute.dataType ?? 'TEXT',
    unitLabel:
      attribute.dataType === 'NUMBER' ? (attribute.unitLabel ?? '') : '',
    status: attribute.isActive === false ? 'INACTIVE' : 'ACTIVE',
  };
}

export function AttributeFormDialog({
  open,
  onOpenChange,
  attribute,
  isPending,
  onSubmit,
}: AttributeFormDialogProps) {
  const { t } = useTranslation();
  const form = useForm<AttributeDefinitionFormValues>({
    resolver: zodResolver(attributeDefinitionSchema),
    defaultValues: defaultAttributeDefinitionForm,
  });
  const { control } = form;
  const dataType = useWatch({ control, name: 'dataType' });
  const attributeId = attribute?.id ?? null;

  const [retained, setRetained] = useState<AttributeDefinitionResponse | null>(
    attribute,
  );
  if (attribute !== null && attribute !== retained) {
    setRetained(attribute);
  } else if (attribute === null && open && retained !== null) {
    setRetained(null);
  }
  const shown = attribute ?? (open ? null : retained);

  useEffect(() => {
    if (open) {
      form.reset(
        attribute ? toFormValues(attribute) : defaultAttributeDefinitionForm,
      );
    }
  }, [open, attributeId, form]);

  const dataTypeOptions: SelectOption[] = AttributeDataTypeValues.map(
    (value) => ({
      value,
      label: t(`enums.AttributeDataType.${value}`),
    }),
  );

  const statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: t('categories.attributeForm.statusActive') },
    { value: 'INACTIVE', label: t('categories.attributeForm.statusInactive') },
  ];

  return (
    <Form {...form}>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title={
          shown
            ? t('categories.attributeForm.editTitle')
            : t('categories.attributeForm.createTitle')
        }
        description={t('categories.attributeForm.description')}
        size="md"
        icon={<Bookmark className="size-5" />}
        submitLabel={t('categories.attributeForm.submit')}
        isPending={isPending}
        canSubmit={!isPending}
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            onSubmit({
              ...values,
              unitLabel: values.dataType === 'NUMBER' ? values.unitLabel : '',
            });
          })(event);
        }}
      >
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
          {shown?.code ? (
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
          {!shown && dataType === 'OPTION' ? (
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
      </FormDialog>
    </Form>
  );
}
