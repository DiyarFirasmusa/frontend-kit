import { Fragment } from 'react';
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
                title={action.title}
                variant={
                  action.variant === 'destructive' ? 'destructive' : 'default'
                }
                className={menuItemTone(action.variant)}
                onClick={action.onSelect}
              >
                {Icon ? <Icon /> : null}
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
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
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Fragment key={action.id}>
              {action.separatorBefore ? (
                <span aria-hidden className="bg-border mx-0.5 h-5 w-px" />
              ) : null}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      data-no-row-click
                      aria-label={action.label}
                      aria-disabled={action.disabled || undefined}
                      onClick={() => {
                        if (!action.disabled) {
                          action.onSelect();
                        }
                      }}
                      className={cn(
                        'row-action',
                        Icon && 'row-action-icon',
                        toneClass(action.variant),
                        'aria-disabled:text-text-inactive aria-disabled:hover:bg-transparent aria-disabled:cursor-not-allowed',
                      )}
                    />
                  }
                >
                  {Icon ? <Icon className="size-4" /> : action.label}
                </TooltipTrigger>
                <TooltipContent>{action.title ?? action.label}</TooltipContent>
              </Tooltip>
            </Fragment>
          );
        })}
      </div>
      <RowActionsMenu
        actions={actions}
        label={label}
        triggerClassName="row-action-menu md:hidden"
      />
    </>
  );
}
