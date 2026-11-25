import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  findActiveGroupId,
  findActiveItemTo,
  useSidebarAccordion,
} from '../hooks/use-sidebar-accordion';
import type { NavGroup, NavItem } from '../types/types';
import { RailTooltip } from './rail-tooltip';

export interface SidebarAccordionProps {
  home?: NavItem;
  groups: readonly NavGroup[];
  path: string;
  onNavigate?: () => void;
  /** Desktop rail: icons only, a group icon expands the sidebar. */
  collapsed?: boolean;
  onExpand?: () => void;
}

const FOCUS_RING =
  'focus-visible:outline-sidebar-ring focus-visible:outline-2 focus-visible:-outline-offset-2';

const ROW_BASE = `flex h-11 min-w-0 items-center gap-3 rounded-xl border border-transparent px-3 transition-colors ${FOCUS_RING}`;
const ROW_IDLE =
  'text-b1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';
const ROW_ACTIVE =
  'text-h5 bg-sidebar-selected text-sidebar-selected-foreground';
const GROUP_OPEN = 'bg-sidebar-accent dark:bg-surface';
const RAIL_BASE = `relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-transparent transition-colors ${FOCUS_RING}`;

interface NavLinkProps {
  item: NavItem;
  onNavigate?: () => void;
}

/** Top-level link (Home): icon + label, pill when active. */
function TopLink({
  item,
  onNavigate,
  collapsed,
}: NavLinkProps & { collapsed: boolean }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const label = t(item.labelKey);

  const icon = <Icon className="size-5 shrink-0" />;
  const linkProps = {
    to: item.to,
    onClick: onNavigate,
    activeOptions: { exact: item.to === '/' },
    activeProps: { className: ROW_ACTIVE },
    inactiveProps: { className: ROW_IDLE },
  };

  if (collapsed) {
    return (
      <RailTooltip
        label={label}
        render={
          <Link {...linkProps} aria-label={label} className={RAIL_BASE} />
        }
      >
        {icon}
      </RailTooltip>
    );
  }
  return (
    <Link {...linkProps} className={ROW_BASE}>
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Link>
  );
}

const NESTED_ACTIVE = 'text-button-2 text-text-primary';
const NESTED_IDLE =
  'text-text-secondary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';

/* Active state comes from the sidebar's own match (longest prefix plus the
   item's extra `matches`), so pages without their own nav entry, such as
   landed costs, still highlight their parent item. The router sets
   aria-current="page" on an exact or nested match; other owned routes get
   aria-current="location". */
function NestedLink({
  item,
  active,
  onNavigate,
}: NavLinkProps & { active: boolean }) {
  const { t } = useTranslation();

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-current={active ? 'location' : undefined}
      className={cn(
        `text-b2 relative flex h-9 min-w-0 items-center gap-2 rounded-lg ps-4 pe-3 transition-colors ${FOCUS_RING}`,
        active ? NESTED_ACTIVE : NESTED_IDLE,
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="bg-primary-highlight absolute inset-y-1 -start-px w-0.5 rounded-full"
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
    </Link>
  );
}

interface AccordionGroupProps {
  group: NavGroup;
  open: boolean;
  path: string;
  onToggle: () => void;
  onNavigate?: () => void;
}

function AccordionGroup({
  group,
  open,
  path,
  onToggle,
  onNavigate,
}: AccordionGroupProps) {
  const { t } = useTranslation();
  const id = useId();
  const headerId = `${id}-header`;
  const panelId = `${id}-panel`;
  const Icon = group.icon;
  const activeItemTo = findActiveItemTo(group.items, path);
  const headerClass = cn(
    ROW_BASE,
    open
      ? 'text-h5 text-sidebar-foreground'
      : 'text-b1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
  );
  const arrow = (
    <ArrowDown
      aria-hidden
      className={cn(
        'text-text-secondary size-4 shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none',
        open && 'rotate-180',
      )}
    />
  );
  const headerBody = (
    <>
      <Icon className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-start">
        {t(group.labelKey)}
      </span>
    </>
  );

  return (
    <div className="flex flex-col gap-1">
      {group.to ? (
        <div className={cn('flex items-center rounded-xl', open && GROUP_OPEN)}>
          <Link
            to={group.to}
            onClick={onNavigate}
            className={cn(headerClass, 'flex-1')}
          >
            {headerBody}
          </Link>
          <button
            type="button"
            id={headerId}
            aria-label={t(group.labelKey)}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground inline-flex h-11 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${FOCUS_RING}`}
          >
            {arrow}
          </button>
        </div>
      ) : (
        <button
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={cn(headerClass, 'w-full', open && GROUP_OPEN)}
        >
          {headerBody}
          {arrow}
        </button>
      )}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
          open
            ? 'grid-rows-[1fr] opacity-100'
            : '-mt-1 grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-sidebar-border ms-[22px] flex flex-col gap-1 border-s">
            {group.items.map((item) => (
              <NestedLink
                key={item.to}
                item={item}
                active={item.to === activeItemTo}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RailGroupProps {
  group: NavGroup;
  active: boolean;
  onSelect: () => void;
}

function RailGroup({ group, active, onSelect }: RailGroupProps) {
  const { t } = useTranslation();
  const Icon = group.icon;
  const label = t(group.labelKey);

  return (
    <RailTooltip
      label={label}
      render={
        <button
          type="button"
          aria-label={label}
          onClick={onSelect}
          className={cn(
            RAIL_BASE,
            active
              ? 'bg-sidebar-selected text-sidebar-selected-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        />
      }
    >
      <Icon className="size-5" />
    </RailTooltip>
  );
}

export function SidebarAccordion({
  home,
  groups,
  path,
  onNavigate,
  collapsed = false,
  onExpand,
}: SidebarAccordionProps) {
  const { isGroupOpen, toggleGroup, openGroup } = useSidebarAccordion(
    groups,
    path,
  );
  const visibleGroups = groups.filter((group) => group.items.length > 0);
  const mainGroups = visibleGroups.filter((group) => !group.pinned);
  const pinnedGroups = visibleGroups.filter((group) => group.pinned);

  if (collapsed) {
    const activeGroupId = findActiveGroupId(visibleGroups, path);
    const renderRailGroup = (group: NavGroup) => (
      <RailGroup
        key={group.id}
        group={group}
        active={group.id === activeGroupId}
        onSelect={() => {
          openGroup(group.id);
          onExpand?.();
        }}
      />
    );
    return (
      <div className="flex flex-1 flex-col items-center gap-2">
        {home ? (
          <TopLink item={home} onNavigate={onNavigate} collapsed />
        ) : null}
        {mainGroups.map((group) => renderRailGroup(group))}
        {pinnedGroups.length > 0 ? (
          <div className="border-sidebar-border mt-auto flex flex-col items-center gap-2 border-t pt-2">
            {pinnedGroups.map((group) => renderRailGroup(group))}
          </div>
        ) : null}
      </div>
    );
  }

  const renderGroup = (group: NavGroup) => (
    <AccordionGroup
      key={group.id}
      group={group}
      open={isGroupOpen(group.id)}
      path={path}
      onToggle={() => {
        toggleGroup(group.id);
      }}
      onNavigate={onNavigate}
    />
  );

  return (
    <div className="gap-row flex flex-1 flex-col">
      <div className="gap-row flex flex-col">
        {home ? (
          <TopLink item={home} onNavigate={onNavigate} collapsed={false} />
        ) : null}
        {mainGroups.map((group) => renderGroup(group))}
      </div>
      {pinnedGroups.length > 0 ? (
        <div className="border-sidebar-border gap-row pt-row mt-auto flex flex-col border-t">
          {pinnedGroups.map((group) => renderGroup(group))}
        </div>
      ) : null}
    </div>
  );
}
