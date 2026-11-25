import type { ComponentProps } from 'react';
import { useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RequiredMark } from '@/components/ui/label';
import { Eye, EyeOff } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { formatInputMode, type FormatKind } from '@/validations/formats';
import { DateInput } from './date-input';
import { TimeInput } from './time-input';
import { useLiveValidation } from './use-live-validation';

export interface TextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  type?: ComponentProps<typeof Input>['type'];
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  dir?: 'ltr' | 'rtl';
  /** The API limit. Not enforced by the input: a longer value shows an error instead. */
  maxLength?: number;
  /** Picks the on-screen keyboard; wrong characters show a validation error. */
  format?: FormatKind;
  /** `type="number"` only: whole numbers (keyboard hint; validation lives in the schema). */
  integer?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  autoComplete,
  disabled,
  required,
  dir,
  maxLength,
  format,
  integer = false,
  min,
  max,
  step,
}: TextFieldProps<T>) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && visible ? 'text' : type;
  const isNumber = type === 'number';
  const validateNow = useLiveValidation(
    name,
    maxLength !== undefined ||
      format !== undefined ||
      (isNumber && (integer || min !== undefined || max !== undefined)),
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
          <div className="relative">
            <FormControl>
              {type === 'date' ? (
                <DateInput
                  placeholder={placeholder}
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ''}
                />
              ) : type === 'time' ? (
                <TimeInput
                  placeholder={placeholder}
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ''}
                />
              ) : (
                <Input
                  type={effectiveType}
                  aria-required={required || undefined}
                  dir={dir}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  disabled={disabled}
                  className={cn(isPassword && 'pe-10')}
                  {...(format ? { inputMode: formatInputMode(format) } : {})}
                  {...(isNumber
                    ? {
                        min,
                        max,
                        step: step ?? (integer ? 1 : 'any'),
                        inputMode: integer ? 'numeric' : 'decimal',
                      }
                    : {})}
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    validateNow();
                  }}
                  value={field.value ?? ''}
                />
              )}
            </FormControl>
            {isPassword ? (
              <button
                type="button"
                tabIndex={-1}
                disabled={disabled}
                onClick={() => {
                  setVisible((v) => !v);
                }}
                aria-label={t(
                  visible ? 'common.hidePassword' : 'common.showPassword',
                )}
                className="text-muted-foreground hover:text-foreground absolute end-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md transition-colors"
              >
                {visible ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            ) : null}
          </div>
          <FormMessage>
            {fieldState.error?.message ? t(fieldState.error.message) : null}
          </FormMessage>
        </FormItem>
      )}
    />
  );
}
