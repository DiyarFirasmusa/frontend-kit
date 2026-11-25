import { useState } from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src: string | null | undefined;
  initials: string;
  className?: string;
}

/** The user's photo, or their initials on the brand fill when there is no photo or it fails to load. */
export function UserAvatar({ src, initials, className }: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-primary text-primary-foreground flex shrink-0 items-center justify-center overflow-hidden',
        className,
      )}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt=""
          className="size-full object-cover"
          onError={() => {
            setFailedSrc(src ?? null);
          }}
        />
      ) : (
        initials
      )}
    </span>
  );
}
