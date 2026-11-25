import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '@/hooks/use-workspace';
import { ArrowLeftLong, ArrowRightLong, Cube, Warehouse } from '@/lib/icons';
import { RailTooltip } from './rail-tooltip';

const FOCUS_RING =
  'focus-visible:outline-sidebar-ring focus-visible:outline-2 focus-visible:-outline-offset-2';

interface SidebarHeaderProps {
  collapsed?: boolean;
  /** Desktop only: omitted in the mobile sheet, which has no rail. */
  onToggleCollapse?: () => void;
}

function BrandMark() {
  return <Cube aria-hidden className="text-warning size-6 shrink-0" />;
}

function CollapseButton({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const label = t(
    collapsed ? 'shell.sidebar.expand' : 'shell.sidebar.collapse',
  );
  const Arrow = collapsed ? ArrowLeftLong : ArrowRightLong;

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={!collapsed}
      onClick={onClick}
      className={`border-sidebar-border text-text-secondary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${FOCUS_RING}`}
    >
      <Arrow aria-hidden className="size-4 rtl:rotate-180" />
    </button>
  );
}

function WorkspaceTile({ children }: { children: ReactNode }) {
  return (
    <span className="bg-background text-primary-highlight inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
      {children}
    </span>
  );
}

export function SidebarHeader({
  collapsed = false,
  onToggleCollapse,
}: SidebarHeaderProps) {
  const { t } = useTranslation();
  const workspace = useWorkspace();
  const workspaceName = workspace.data?.name?.trim() || '—';

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <BrandMark />
        {onToggleCollapse ? (
          <CollapseButton collapsed onClick={onToggleCollapse} />
        ) : null}
        <RailTooltip
          label={`${t('shell.workspace.label')}: ${workspaceName}`}
          render={
            <span
              role="img"
              aria-label={`${t('shell.workspace.label')}: ${workspaceName}`}
              className="bg-surface border-sidebar-border inline-flex rounded-xl border p-[3px]"
            />
          }
        >
          <WorkspaceTile>
            <Warehouse className="size-5" />
          </WorkspaceTile>
        </RailTooltip>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BrandMark />
        <p className="text-h4 min-w-0 flex-1 truncate">
          {t('shell.sidebar.title')}
        </p>
        {onToggleCollapse ? (
          <CollapseButton collapsed={false} onClick={onToggleCollapse} />
        ) : null}
      </div>
      <div className="bg-sidebar-accent flex flex-col gap-1 rounded-xl p-3">
        <p className="text-text-muted text-b3">{t('shell.workspace.label')}</p>
        <p className="text-label line-clamp-2 wrap-break-word">
          {workspaceName}
        </p>
      </div>
    </div>
  );
}
