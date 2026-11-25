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
import { Combobox } from './combobox';
import type { SelectOption } from './select-option';

export interface ComboboxFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
  /** Shows a clear button while a value is picked. Defaults to `!required`. */
  clearable?: boolean;
  selectedLabel?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  /**
   * Fires on every typed change, alongside onQueryChange. Also fires with ''
   * when the query is cleared on pick, and on popup close in uncontrolled mode
   * (only when a non-empty query is cleared).
   */
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
  onOpenChange?: (open: boolean) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function ComboboxField<T extends FieldValues>({
  control,
  name,
  options,
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  required,
  clearable,
  selectedLabel,
  query,
  onQueryChange,
  onSearchChange,
  isLoading,
  onOpenChange,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: ComboboxFieldProps<T>) {
  const { t } = useTranslation();
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
            <Combobox
              value={field.value ?? ''}
              onChange={field.onChange}
              options={options}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              emptyMessage={emptyMessage}
              disabled={disabled}
              invalid={Boolean(fieldState.error)}
              required={required}
              clearable={clearable}
              aria-label={label}
              selectedLabel={selectedLabel}
              query={query}
              onQueryChange={onQueryChange}
              onSearchChange={onSearchChange}
              isLoading={isLoading}
              onOpenChange={onOpenChange}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
              isLoadingMore={isLoadingMore}
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
