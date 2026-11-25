import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { IconComponent } from '@/lib/icons';
import { cn } from '@/lib/utils';

/* Pill tabs from the design system. Visuals live in src/style/tabs.css.
   Controlled component: the caller owns the active id. Each tab is linked to
   its panel through ids derived from the item id, so TabPanel can be rendered
   anywhere in the tree (siblings of Tabs included). Pass the same `idPrefix`
   (e.g. React.useId()) to Tabs and every TabPanel when a page holds more than
   one tab set. Arrow keys move focus (roving tabIndex). */

export interface TabItem<TId extends string = string> {
  id: TId;
  label: string;
  icon?: IconComponent;
  count?: number;
  disabled?: boolean;
}

interface TabsProps<TId extends string = string> {
  items: readonly TabItem<TId>[];
  value: TId;
  onValueChange: (id: TId) => void;
  /** Split triggers evenly across the track — used on narrow screens. */
  fill?: boolean;
  /** `pill` (default): filled active pill. `plain`: text-only triggers in a bordered strip (13.03). */
  variant?: 'pill' | 'plain';
  className?: string;
  'aria-label'?: string;
  /** Scopes DOM ids so several tab sets can share a page (use React.useId()). */
  idPrefix?: string;
}

function tabDomId(id: string, idPrefix?: string) {
  return idPrefix ? `${idPrefix}-tab-${id}` : `tab-${id}`;
}

function panelDomId(id: string, idPrefix?: string) {
  return idPrefix ? `${idPrefix}-tabpanel-${id}` : `tabpanel-${id}`;
}

export function Tabs<TId extends string = string>({
  items,
  value,
  onValueChange,
  fill = false,
  variant = 'pill',
  className,
  'aria-label': ariaLabel,
  idPrefix,
}: TabsProps<TId>) {
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const hasEnabledActive = items.some(
    (item) => item.id === value && !item.disabled,
  );
  const fallbackId = items.find((item) => !item.disabled)?.id;

  function moveTo(index: number) {
    const target = items[index];
    if (!target) {
      return;
    }
    onValueChange(target.id);
    buttons.current.get(target.id)?.focus();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const enabled = items.flatMap((item, i) => (item.disabled ? [] : [i]));
    const position = enabled.indexOf(index);
    if (position === -1 || enabled.length === 0) {
      return;
    }
    const rtl = document.documentElement.dir === 'rtl';
    const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    let target: number | undefined;
    if (event.key === nextKey) {
      target = enabled[(position + 1) % enabled.length];
    } else if (event.key === prevKey) {
      target = enabled[(position - 1 + enabled.length) % enabled.length];
    } else if (event.key === 'Home') {
      target = enabled[0];
    } else if (event.key === 'End') {
      target = enabled.at(-1);
    }
    if (target !== undefined) {
      event.preventDefault();
      moveTo(target);
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      data-variant={variant}
      className={cn(
        'tabs-track',
        fill && 'tabs-track-fill',
        variant === 'plain' && 'tabs-track-plain',
        className,
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const active = item.id === value;
        const focusable = hasEnabledActive ? active : item.id === fallbackId;
        return (
          <button
            key={item.id}
            ref={(element) => {
              if (element) {
                buttons.current.set(item.id, element);
              } else {
                buttons.current.delete(item.id);
              }
            }}
            id={tabDomId(item.id, idPrefix)}
            type="button"
            role="tab"
            className="tab"
            aria-selected={active}
            aria-controls={active ? panelDomId(item.id, idPrefix) : undefined}
            tabIndex={focusable ? 0 : -1}
            disabled={item.disabled}
            onClick={() => {
              onValueChange(item.id);
            }}
            onKeyDown={(event) => {
              handleKeyDown(event, index);
            }}
          >
            {Icon ? <Icon aria-hidden /> : null}
            {item.label}
            {item.count === undefined ? null : (
              <span className="tab-count tabular-nums">{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps<TId extends string = string> {
  active: boolean;
  children: ReactNode;
  className?: string;
  /** The matching TabItem id; links the panel to its tab (required). */
  value: TId;
  /** Must match the idPrefix passed to the sibling Tabs. */
  idPrefix?: string;
}

export function TabPanel<TId extends string = string>({
  active,
  children,
  className,
  value,
  idPrefix,
}: TabPanelProps<TId>) {
  if (!active) {
    return null;
  }
  return (
    <div
      role="tabpanel"
      id={panelDomId(value, idPrefix)}
      aria-labelledby={tabDomId(value, idPrefix)}
      className={cn('animate-in fade-in duration-200', className)}
    >
      {children}
    </div>
  );
}
