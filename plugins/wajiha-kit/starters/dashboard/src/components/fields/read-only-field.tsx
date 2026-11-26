import { useId, type ReactNode } from 'react';
import { Lock } from '@/lib/icons';
import { cn } from '@/lib/utils';

export interface ReadOnlyFieldProps {
  label: string;
  /** Strings are trimmed; an empty, `null` or `undefined` value renders `'—'`. */
  value: ReactNode;
  /** Screen-reader text for the lock glyph beside the label, e.g. "code cannot be changed". */
  locked?: string;
  dir?: 'ltr' | 'rtl';
  /** Glyph at the end of the box, e.g. the chevron of a read-only select. */
  trailing?: ReactNode;
  className?: string;
}

function displayValue(value: ReactNode): ReactNode {
  if (value === null || value === undefined || value === false) {
    return '—';
  }
  if (typeof value === 'string') {
    return value.trim() || '—';
  }
  return value;
}

/** A labelled value in a read-only control box (13.03, 14.01, 19.02). */
export function ReadOnlyField({
  label,
  value,
  locked,
  dir,
  trailing,
  className,
}: ReadOnlyFieldProps) {
  const id = useId();
  return (
    <div className={cn('gap-field flex min-w-0 flex-col', className)}>
      <span
        id={id}
        className="text-label text-text-primary flex items-center gap-1"
      >
        {label}
        {locked ? (
          <>
            <Lock className="text-brand-text size-3.5" aria-hidden />
            <span className="sr-only">{locked}</span>
          </>
        ) : null}
      </span>
      <div
        role="textbox"
        aria-readonly
        aria-labelledby={id}
        className={cn(
          'control gap-field flex items-center justify-between',
          locked ? 'text-text-secondary' : 'text-text-primary',
        )}
      >
        <span className="min-w-0 truncate" dir={dir}>
          {displayValue(value)}
        </span>
        {trailing}
      </div>
    </div>
  );
}
