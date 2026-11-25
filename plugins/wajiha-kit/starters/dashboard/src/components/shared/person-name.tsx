import { DataBadge } from '@/components/table/data-badge';
import { useDirectoryEntry } from '@/hooks/lookups/use-directory-entry';
import { cn } from '@/lib/utils';
import type { DirectoryKind } from '@/services/directory.service';
import { formatShortId } from '@/utils/format';

interface PersonNameProps {
  id: string | null | undefined;
  kind?: DirectoryKind;
  /** A name the list response already carries; skips the directory lookup. */
  name?: string | null;
  className?: string;
  /** Adds the directory subtitle (job and department) under the name. */
  showSubtitle?: boolean;
  /** Adds the employment status badge next to the name. */
  showStatus?: boolean;
}

/** Shows the name behind a user, employee or org-unit id, or the short id until it is known. */
export function PersonName({
  id,
  kind = 'user',
  name: knownName,
  className,
  showSubtitle = false,
  showStatus = false,
}: PersonNameProps) {
  const entry = useDirectoryEntry(kind, knownName ? null : id);
  const name = knownName || entry?.name || formatShortId(id);
  const subtitle = showSubtitle ? entry?.subtitle : null;
  const status = showStatus ? entry?.employmentStatus : null;

  if (!subtitle && !status) {
    return (
      <span className={cn('min-w-0', className)} title={id ?? undefined}>
        {name}
      </span>
    );
  }

  return (
    <span
      className={cn('inline-flex min-w-0 flex-col align-top', className)}
      title={id ?? undefined}
    >
      <span className="gap-field flex min-w-0 items-center">
        <span className="min-w-0">{name}</span>
        {status ? (
          <DataBadge tone="neutral" dot>
            {status}
          </DataBadge>
        ) : null}
      </span>
      {subtitle ? (
        <span className="text-b3 text-text-muted min-w-0">{subtitle}</span>
      ) : null}
    </span>
  );
}
