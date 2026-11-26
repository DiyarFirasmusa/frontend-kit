import { useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogIconTile,
  DialogLayout,
} from '@/components/dialog/dialog-layout';
import { DataBadge } from '@/components/table/data-badge';
import type { BadgeTone } from '@/components/table/data-badge';
import { Button } from '@/components/ui/button';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { PERMS } from '@/constants/permissions';
import { useAuditLog } from '@/hooks/use-audit-log';
import { Clock } from '@/lib/icons';
import { useHasPermission } from '@/store/permission-store';
import type { AuditChange, AuditLogResponse } from '@/types/api/audit';
import type { AuditAction, AuditEntity } from '@/types/api/enums';
import { formatDateTime } from '@/utils/format';
import { PersonName } from './person-name';

const ACTION_TONE: Record<AuditAction, BadgeTone> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
};

type ButtonVariant = ComponentProps<typeof Button>['variant'];

interface AuditLogButtonProps {
  entity: AuditEntity;
  entityId?: string;
  className?: string;
  /** Overrides the default "Change log" label, e.g. "Decision log" (21.06). */
  label?: string;
  variant?: ButtonVariant;
  /** Hides the leading clock glyph (21.06 shows a text-only button). */
  showIcon?: boolean;
}

/** "Change log" action: opens the history of one record, or of the whole entity when no id is given. */
export function AuditLogButton({
  entity,
  entityId,
  className,
  label,
  variant = 'outline',
  showIcon = true,
}: AuditLogButtonProps) {
  const { t } = useTranslation();
  const canRead = useHasPermission(PERMS.auditLog.view);
  const [open, setOpen] = useState(false);
  const log = useAuditLog({ entity, entityId, enabled: open && canRead });

  if (!canRead) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={() => {
          setOpen(true);
        }}
      >
        {showIcon ? <Clock className="size-4" /> : null}
        {label ?? t('auditLog.open')}
      </Button>
      <DialogLayout
        open={open}
        onOpenChange={setOpen}
        size="lg"
        icon={<DialogIconTile icon={<Clock />} />}
        title={t('auditLog.title')}
        description={`${t(`auditLog.entities.${entity}`)} · ${t('auditLog.description')}`}
      >
        <Wrapper
          isLoading={log.isLoading}
          isError={log.isError}
          error={log.error}
          data={log.data ? log.entries : null}
          isEmpty={(entries) => entries.length === 0}
          emptyMessage={t('auditLog.empty')}
          errorMessage={t('auditLog.error')}
          onRetry={() => {
            void log.refetch();
          }}
        >
          {(entries) => (
            <div className="gap-row flex flex-col">
              <ol className="gap-row flex flex-col">
                {entries.map((entry) => (
                  <AuditEntryItem
                    key={entry.id}
                    entry={entry}
                    entity={entity}
                  />
                ))}
              </ol>
              {log.hasNextPage ? (
                <Button
                  type="button"
                  variant="outline"
                  className="self-center"
                  disabled={log.isFetchingNextPage}
                  onClick={() => {
                    void log.fetchNextPage();
                  }}
                >
                  {t('auditLog.loadMore')}
                </Button>
              ) : null}
            </div>
          )}
        </Wrapper>
      </DialogLayout>
    </>
  );
}

function AuditEntryItem({
  entry,
  entity,
}: {
  entry: AuditLogResponse;
  entity: AuditEntity;
}) {
  const { t } = useTranslation();
  const action = entry.action;
  const changes = entry.changes ?? [];
  return (
    <li className="border-stroke gap-field flex flex-col rounded-(--radius) border p-4">
      <div className="gap-inline flex flex-wrap items-center justify-between">
        <div className="gap-field flex flex-wrap items-center">
          <DataBadge
            tone={action ? ACTION_TONE[action] : 'neutral'}
            shape="pill"
            dot
          >
            {action ? t(`auditLog.actions.${action}`) : '—'}
          </DataBadge>
          {entry.entity && entry.entity !== entity ? (
            <span className="text-b3 text-text-muted">
              {t(`auditLog.entities.${entry.entity}`)}
            </span>
          ) : null}
          <span className="text-b2 text-text-secondary">
            {t('auditLog.by')} <PersonName id={entry.changedBy} showSubtitle />
          </span>
        </div>
        <time
          className="text-b3 text-text-muted tabular-nums"
          dateTime={entry.changedAt ?? undefined}
        >
          {formatDateTime(entry.changedAt ?? undefined)}
        </time>
      </div>
      {changes.length > 0 ? (
        <table className="text-b2 w-full table-fixed">
          <thead>
            <tr className="text-table-header text-text-muted text-start">
              <th className="py-1 text-start font-normal">
                {t('auditLog.field')}
              </th>
              <th className="py-1 text-start font-normal">
                {t('auditLog.before')}
              </th>
              <th className="py-1 text-start font-normal">
                {t('auditLog.after')}
              </th>
            </tr>
          </thead>
          <tbody>
            {changes.map((change, index) => (
              <tr
                key={`${change.field ?? ''}-${String(index)}`}
                className="border-stroke-subtle border-bs"
              >
                <td className="py-1 font-medium break-words">
                  {change.field ?? '—'}
                </td>
                <td className="text-text-secondary py-1 break-words">
                  {formatAuditValue(change.oldValue)}
                </td>
                <td className="py-1 break-words">
                  {formatAuditValue(change.newValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-b3 text-text-muted">
          {t('auditLog.noFieldChanges')}
        </p>
      )}
    </li>
  );
}

function formatAuditValue(value: AuditChange['oldValue']): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}
