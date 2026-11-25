import { useId } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface ReadOnlySwitchRowProps {
  label: string;
  checked: boolean;
  className?: string;
}

/** A label with a read-only switch on a divider row, for flags shown but not edited here (13.03, 14.01). */
export function ReadOnlySwitchRow({
  label,
  checked,
  className,
}: ReadOnlySwitchRowProps) {
  const id = useId();
  return (
    <div
      className={cn(
        'border-stroke gap-inline flex items-center justify-between border-b pb-3',
        className,
      )}
    >
      <span id={id} className="text-b2 text-text-secondary">
        {label}
      </span>
      <Switch checked={checked} readOnly aria-labelledby={id} />
    </div>
  );
}
