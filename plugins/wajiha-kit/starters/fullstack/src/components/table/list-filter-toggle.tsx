import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/shared/utils/cn';

export interface ListFilterToggleProps {
  id?: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Optional count shown after the label ("Awaiting my approval 3"). */
  count?: number;
  className?: string;
}

/** Boolean quick filter: a checkbox in a bordered tile, boxed like the other toolbar controls. */
export function ListFilterToggle({
  id,
  label,
  checked,
  onCheckedChange,
  count,
  className,
}: ListFilterToggleProps) {
  return (
    <label
      className={cn(
        'control select-trigger-compact w-auto cursor-pointer px-3 whitespace-nowrap',
        checked ? 'text-text-primary' : 'text-text-secondary',
        className,
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(next) => {
          onCheckedChange(next);
        }}
      />
      {label}
      {count === undefined ? null : (
        <span className="text-text-primary bg-hover-row inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums">
          {count}
        </span>
      )}
    </label>
  );
}
