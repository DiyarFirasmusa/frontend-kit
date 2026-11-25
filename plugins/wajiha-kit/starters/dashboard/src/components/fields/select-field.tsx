import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ClearableControl } from '@/components/ui/clearable-control';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RequiredMark } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SelectOption } from './select-option';

export type { SelectOption } from './select-option';

/** Base UI Select rejects empty-string item values; map '' ↔ this sentinel. */
const EMPTY_SELECT_VALUE = '__empty__';

export function toSelectValue(value: string): string {
  return value === '' ? EMPTY_SELECT_VALUE : value;
}

export function fromSelectValue(value: string | null | undefined): string {
  if (!value || value === EMPTY_SELECT_VALUE) {
    return '';
  }
  return value;
}

export function selectItemValue(value: string): string {
  return toSelectValue(value);
}

export interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Shows a clear button while a value is picked. Defaults to `!required`. */
  clearable?: boolean;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  options,
  label,
  placeholder,
  disabled,
  required,
  clearable = !required,
}: SelectFieldProps<T>) {
  const { t } = useTranslation();
  const shownPlaceholder = placeholder ?? t('common.select');
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = fromSelectValue(field.value ?? '');
        return (
          <FormItem>
            {label ? (
              <FormLabel>
                {label}
                {required ? <RequiredMark /> : null}
              </FormLabel>
            ) : null}
            <Select
              value={toSelectValue(value)}
              onValueChange={(next) => {
                field.onChange(fromSelectValue(next));
              }}
              disabled={disabled}
            >
              <ClearableControl
                canClear={clearable && !disabled && value !== ''}
                onClear={() => {
                  field.onChange('');
                }}
              >
                <FormControl>
                  <SelectTrigger aria-required={required || undefined}>
                    <SelectValue placeholder={shownPlaceholder}>
                      {(value: string) =>
                        options.find(
                          (opt) => toSelectValue(opt.value) === value,
                        )?.label ?? shownPlaceholder
                      }
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
              </ClearableControl>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem
                    key={selectItemValue(opt.value)}
                    value={selectItemValue(opt.value)}
                    disabled={opt.disabled}
                    title={opt.label}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage>
              {fieldState.error?.message ? t(fieldState.error.message) : null}
            </FormMessage>
          </FormItem>
        );
      }}
    />
  );
}
