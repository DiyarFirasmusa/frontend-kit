import { useState, type ComponentProps } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RequiredMark } from '@/components/ui/label';
import { NumberInput } from './number-input';
import { useLiveValidation } from './use-live-validation';

export interface NumberFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  min,
  max,
  step,
  integer,
  disabled,
  required,
}: NumberFieldProps<T>) {
  const { t } = useTranslation();
  const validateNow = useLiveValidation(
    name,
    integer === true || min !== undefined || max !== undefined,
  );
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
            <NumberFieldInput
              integer={integer}
              aria-required={required || undefined}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                validateNow();
              }}
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

type NumberFieldInputProps = Omit<
  ComponentProps<typeof NumberInput>,
  'value' | 'onChange'
> & {
  value: unknown;
  onValueChange: (value: number | undefined) => void;
};

/**
 * Keeps an emptied box empty: react-hook-form reports a cleared (undefined)
 * value as the field's default, which would put the old number back and make
 * the next keystroke append to it.
 */
function NumberFieldInput({
  value,
  onValueChange,
  ...props
}: NumberFieldInputProps) {
  const [isCleared, setIsCleared] = useState(false);
  const shown =
    isCleared || value === undefined || value === null ? '' : String(value);
  return (
    <NumberInput
      {...props}
      value={shown}
      onChange={(e) => {
        const next = e.target.value;
        setIsCleared(next === '');
        onValueChange(next === '' ? undefined : Number(next));
      }}
    />
  );
}
