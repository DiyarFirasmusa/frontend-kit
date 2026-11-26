import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  DialogFormFullWidth,
  DialogFormGrid,
} from '@/components/dialog/dialog-form-grid';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import type { OptionFormMode } from '../../hooks/form/use-option-drafts';
import type { AttributeOptionFormValues } from '../../validations/validations';

interface OptionFormSectionProps {
  mode: Exclude<OptionFormMode, { kind: 'closed' }>;
  form: UseFormReturn<AttributeOptionFormValues>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
}

/** The add or edit form of one option, shown under the list. */
export function OptionFormSection({
  mode,
  form,
  onSubmit,
  onCancel,
}: OptionFormSectionProps) {
  const { t } = useTranslation();
  return (
    <section className="space-y-row border-stroke pt-card border-t">
      <h3 className="text-h5">
        {mode.kind === 'edit'
          ? t('categories.options.formEditTitle')
          : t('categories.options.formCreateTitle')}
      </h3>
      <Form {...form}>
        <form
          noValidate
          onSubmit={(event) => {
            event.stopPropagation();
            void onSubmit(event);
          }}
          className="space-y-row"
        >
          <DialogFormGrid>
            <TextField
              control={form.control}
              placeholder={t('categories.options.labelPlaceholder')}
              name="label"
              label={t('categories.options.label')}
              maxLength={100}
              required
            />
            <DialogFormFullWidth>
              <SwitchField
                control={form.control}
                name="isActive"
                label={t('categories.form.isActive')}
              />
            </DialogFormFullWidth>
          </DialogFormGrid>
          <div className="gap-row flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('categories.options.cancelForm')}
            </Button>
            <Button type="submit">
              {mode.kind === 'edit'
                ? t('categories.options.confirmEdit')
                : t('categories.options.confirmAdd')}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
