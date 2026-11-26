import { Input as InputPrimitive } from '@base-ui/react/input';
import * as React from 'react';
import { cn } from '@/shared/utils/cn';

/* Geometry, border and focus states come from `.control` (src/style/input.css). */

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'control min-w-0 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
