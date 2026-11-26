import { useMemo, useState } from 'react';
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
import { useDirectoryEntryState } from '@/hooks/lookups/use-directory-entry';
import { useDirectorySearch } from '@/hooks/lookups/use-directory-search';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  DIRECTORY_KIND_BY_SEARCH_KIND,
  type DirectorySearchKind,
} from '@/services/directory.service';
import { formatShortId } from '@/utils/format';
import { Combobox } from './combobox';
import type { SelectOption } from './select-option';

export interface PersonControlProps {
  kind: DirectorySearchKind;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  'aria-describedby'?: string;
}

/**
 * Search-as-you-type picker over `GET /api/directory/search`. The value is the
 * uuid; the trigger shows the resolved name.
 */
export function PersonControl({
  kind,
  value,
  onChange,
  id,
  label,
  placeholder,
  disabled,
  invalid,
  required,
  'aria-describedby': ariaDescribedBy,
}: PersonControlProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [hasOpened, setHasOpened] = useState(false);
  const debounced = useDebouncedValue(query);
  const search = useDirectorySearch(kind, debounced, hasOpened);
  const { entry, isLoading: isResolving } = useDirectoryEntryState(
    DIRECTORY_KIND_BY_SEARCH_KIND[kind],
    value,
  );

  const options = useMemo<SelectOption[]>(() => {
    const found = search.data.map((person) => ({
      value: person.id,
      label: person.name || formatShortId(person.id),
      description: person.subtitle || undefined,
    }));
    if (required || value === '' || query !== '' || search.isError) {
      return found;
    }
    return [{ value: '', label: t('common.none') }, ...found];
  }, [search.data, search.isError, required, value, query, t]);

  let selectedLabel: string | undefined;
  if (value) {
    selectedLabel = entry?.name || (isResolving ? '…' : formatShortId(value));
  }

  return (
    <Combobox
      id={id}
      aria-describedby={ariaDescribedBy}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={t('common.searchByName')}
      emptyMessage={search.isError ? t('common.loadError') : undefined}
      disabled={disabled}
      invalid={invalid}
      required={required}
      aria-label={label}
      selectedLabel={selectedLabel}
      query={query}
      onQueryChange={setQuery}
      onOpenChange={(open) => {
        if (open) {
          setHasOpened(true);
        }
      }}
      isLoading={search.isLoading}
    />
  );
}

export interface PersonSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  kind: DirectorySearchKind;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function PersonSelectField<T extends FieldValues>({
  control,
  name,
  kind,
  label,
  placeholder,
  disabled,
  required,
}: PersonSelectFieldProps<T>) {
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
            <PersonControl
              kind={kind}
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={field.onChange}
              label={label}
              placeholder={placeholder}
              disabled={disabled}
              invalid={Boolean(fieldState.error)}
              required={required}
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
