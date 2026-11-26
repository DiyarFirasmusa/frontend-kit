import { cn } from '@/shared/utils/cn';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'rounded-md bg-[linear-gradient(90deg,var(--hover-row)_0%,var(--stroke-subtle)_50%,var(--hover-row)_100%)] bg-size-[200%_100%] animate-skeleton-shimmer motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
