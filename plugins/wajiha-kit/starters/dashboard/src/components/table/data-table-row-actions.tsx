import { Fragment, useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MoreHorizontal, type IconComponent } from '@/lib/icons';
import { cn } from '@/lib/utils';

type RowActionVariant =
  | 'default'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'primary';

export interface RowAction {
  id: string;
  label: string;
  icon?: IconComponent;
  onSelect: () => void;
  variant?: RowActionVariant;
  disabled?: boolean;
  title?: string;
  /**
   * Allowed in general but not for this row: the control stays focusable
   * (`aria-disabled`), does nothing, and this text explains why to screen
   * readers (inline) and on screen (menu).
   */
  disabledReason?: string;

  separatorBefore?: boolean;
}

const TONE_CLASS: Record<Exclude<RowActionVariant, 'default'>, string> = {
  primary: 'row-action-primary',
  destructive: 'row-action-destructive',
  success: 'row-action-success',
  warning: 'row-action-warning',
};

function toneClass(variant: RowActionVariant | undefined): string | undefined {
  if (!variant || variant === 'default') {
    return undefined;
  }
  return TONE_CLASS[variant];
}

const MENU_ITEM_TONE: Record<
  Exclude<RowActionVariant, 'default' | 'destructive'>,
  string
> = {
  primary: 'text-primary-text',
  success: 'text-success',
  warning: 'text-warning',
};

function menuItemTone(variant: RowActionVariant | undefined) {
  if (!variant || variant === 'default' || variant === 'destructive') {
    return;
  }
  return MENU_ITEM_TONE[variant];
}

export interface DataTableRowActionsProps {
  actions: RowAction[];
  /**
   * `inline` (default): icon buttons on wide screens, a menu on narrow ones.
   * `menu`: only the "⋯" menu trigger, at every width (04.01, 13.04, 14.01).
   */
  variant?: 'inline' | 'menu';
  /** Accessible name of the menu trigger; defaults to "Actions". */
  menuLabel?: string;
  className?: string;
}

interface RowActionsMenuProps {
  actions: RowAction[];
  label: string;
  triggerClassName: string;
}

function RowActionsMenu({
  actions,
  label,
  triggerClassName,
}: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-no-row-click
        aria-label={label}
        className={triggerClassName}
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Fragment key={action.id}>
              {action.separatorBefore ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                disabled={action.disabled}
                aria-disabled={action.disabledReason ? true : undefined}
                title={action.title}
                variant={
                  action.variant === 'destructive' && !action.disabledReason
                    ? 'destructive'
                    : 'default'
                }
                className={cn(
                  menuItemTone(action.variant),
                  action.disabledReason && 'text-text-inactive items-start',
                )}
                onClick={() => {
                  if (!action.disabledReason) {
                    action.onSelect();
                  }
                }}
              >
                {Icon ? <Icon /> : null}
                {action.disabledReason ? (
                  <span className="flex flex-col">
                    {action.label}
                    <span className="text-b3 text-text-secondary max-w-56 whitespace-normal">
                      {action.disabledReason}
                    </span>
                  </span>
                ) : (
                  action.label
                )}
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InlineRowAction({ action }: { action: RowAction }) {
  const reasonId = useId();
  const Icon = action.icon;
  const blocked = Boolean(action.disabled || action.disabledReason);
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            data-no-row-click
            aria-label={action.label}
            aria-disabled={blocked || undefined}
            aria-describedby={action.disabledReason ? reasonId : undefined}
            onClick={() => {
              // aria-disabled blocks nothing by itself.
              if (!blocked) {
                action.onSelect();
              }
            }}
            className={cn(
              'row-action',
              Icon && 'row-action-icon',
              toneClass(action.variant),
              'aria-disabled:text-text-inactive aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent',
            )}
          />
        }
      >
        {Icon ? <Icon className="size-4" /> : action.label}
        {action.disabledReason ? (
          <span id={reasonId} className="sr-only">
            {action.disabledReason}
          </span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent>
        {action.disabledReason ?? action.title ?? action.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function DataTableRowActions({
  actions,
  variant = 'inline',
  menuLabel,
  className,
}: DataTableRowActionsProps) {
  const { t } = useTranslation();

  if (actions.length === 0) {
    return null;
  }

  const label = menuLabel ?? t('common.actions');

  if (variant === 'menu') {
    return (
      <RowActionsMenu
        actions={actions}
        label={label}
        triggerClassName={cn('row-action-menu', className)}
      />
    );
  }

  return (
    <>
      <div
        className={cn(
          'hidden flex-nowrap items-center justify-start gap-1.5 md:flex',
          className,
        )}
      >
        {actions.map((action) => (
          <Fragment key={action.id}>
            {action.separatorBefore ? (
              <span aria-hidden className="bg-border mx-0.5 h-5 w-px" />
            ) : null}
            <InlineRowAction action={action} />
          </Fragment>
        ))}
      </div>
      <RowActionsMenu
        actions={actions}
        label={label}
        triggerClassName="row-action-menu md:hidden"
      />
    </>
  );
}
