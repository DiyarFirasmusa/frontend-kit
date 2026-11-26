import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RequiredMark } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLiveValidation } from './use-live-validation';

export interface TextareaFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  rows?: number;
  /** The API limit. Not enforced by the input: a longer value shows an error instead. */
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rows = 4,
  maxLength,
  disabled,
  required,
}: TextareaFieldProps<T>) {
  const { t } = useTranslation();
  const validateNow = useLiveValidation(name, maxLength !== undefined);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label ? (
            <FormLabel>
              {label}
              {required ? <RequiredMark /> : null}
            </FormLabel>
          ) : null}
          <FormControl>
            <Textarea
              rows={rows}
              aria-required={required || undefined}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              onChange={(event) => {
                field.onChange(event);
                validateNow();
              }}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage>
            {fieldState.error?.message ? t(fieldState.error.message) : null}
          </FormMessage>
        </FormItem>
      )}
    />
  );
}
