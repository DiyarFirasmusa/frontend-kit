import * as React from 'react';
import { cn } from '@/lib/utils';

/* Geometry, border and focus states come from `.control` + `.control-area`
   (src/style/input.css). */

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn('control control-area field-sizing-content', className)}
      {...props}
    />
  );
}

export { Textarea };
