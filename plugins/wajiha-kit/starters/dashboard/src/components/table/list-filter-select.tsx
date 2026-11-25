import { useTranslation } from 'react-i18next';
import {
  fromSelectValue,
  selectItemValue,
  toSelectValue,
} from '@/components/fields/select-field';
import type { SelectOption } from '@/components/fields/select-option';
import { ClearableControl } from '@/components/ui/clearable-control';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface ListFilterSelectProps {
  id?: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Adds "All" as the first option; picking it clears the filter. Off for required choices (sort order). */
  allowAll?: boolean;
  /** Prefix the picked value with the filter name ("Sort: oldest first"). Defaults to `!allowAll`. */
  prefixLabel?: boolean;
  className?: string;
}

/** Compact toolbar select: the trigger reads the filter name until a value is picked. */
export function ListFilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  allowAll = true,
  prefixLabel = !allowAll,
  className,
}: ListFilterSelectProps) {
  const { t } = useTranslation();
  const items: SelectOption[] = allowAll
    ? [{ value: '', label: t('common.all') }, ...options]
    : options;
  const selected =
    value === '' ? undefined : options.find((o) => o.value === value);

  return (
    <Select
      value={toSelectValue(value)}
      onValueChange={(next) => {
        onChange(fromSelectValue(next));
      }}
      disabled={disabled}
    >
      <ClearableControl
        canClear={allowAll && !disabled && value !== ''}
        onClear={() => {
          onChange('');
        }}
        className={cn('w-full min-w-32 sm:w-auto', className)}
      >
        <SelectTrigger
          id={id}
          size="sm"
          aria-label={label}
          className={cn(
            'w-full min-w-32 sm:w-auto',
            selected ? 'text-text-primary' : 'text-text-secondary',
            className,
          )}
        >
          <SelectValue>
            {() =>
              selected
                ? prefixLabel
                  ? `${label}: ${selected.label}`
                  : selected.label
                : label
            }
          </SelectValue>
        </SelectTrigger>
      </ClearableControl>
      <SelectContent>
        {items.map((option) => (
          <SelectItem
            key={selectItemValue(option.value)}
            value={selectItemValue(option.value)}
            disabled={option.disabled}
            title={option.label}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
