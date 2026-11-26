import * as React from 'react';
import { cn } from '@/shared/utils/cn';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-label select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

/** Required marker after a label: danger colour, hidden from assistive tech
    (the control carries `aria-required`/`required` instead). */
function RequiredMark({ className }: { className?: string }) {
  return (
    <span data-slot="required-mark" aria-hidden="true" className={cn('text-danger', className)}>
      {' *'}
    </span>
  );
}

export { Label, RequiredMark };
