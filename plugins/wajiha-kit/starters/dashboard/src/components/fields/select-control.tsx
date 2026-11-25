import { useTranslation } from 'react-i18next';
import { ClearableControl } from '@/components/ui/clearable-control';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  fromSelectValue,
  selectItemValue,
  toSelectValue,
} from './select-field';
import type { SelectOption } from './select-option';

export interface SelectControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Opt in for optional choices and filters: shows a clear button while a value is picked. */
  clearable?: boolean;
  className?: string;
  size?: 'sm' | 'default';
}

export function SelectControl({
  value,
  onChange,
  options,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  placeholder,
  disabled,
  invalid,
  clearable = false,
  className,
  size = 'default',
}: SelectControlProps) {
  const { t } = useTranslation();
  const shownPlaceholder = placeholder ?? t('common.select');
  return (
    <Select
      value={toSelectValue(value)}
      onValueChange={(next) => {
        onChange(fromSelectValue(next));
      }}
      disabled={disabled}
    >
      <ClearableControl
        canClear={clearable && !disabled && value !== ''}
        onClear={() => {
          onChange('');
        }}
        className={className}
      >
        <SelectTrigger
          id={id}
          size={size}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-invalid={invalid || undefined}
          className={cn(className)}
        >
          <SelectValue placeholder={shownPlaceholder}>
            {(selected: string) =>
              options.find((opt) => toSelectValue(opt.value) === selected)
                ?.label ?? shownPlaceholder
            }
          </SelectValue>
        </SelectTrigger>
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
  );
}
