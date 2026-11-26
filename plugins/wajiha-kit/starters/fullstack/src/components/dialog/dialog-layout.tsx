import type { ComponentProps, ReactNode } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/shared/utils/cn';

type DialogSize = ComponentProps<typeof DialogContent>['size'];

/** `destructive` is kept as an alias of `danger`. */
export type DialogIconTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'destructive';

/** `inline`: icon beside the title (13.02, 19.02). `stacked`: icon above it (03.02, 03.03). */
export type DialogIconLayout = 'inline' | 'stacked';

const TILE_TONE: Record<DialogIconTone, string> = {
  brand: 'bg-primary-light text-primary-text',
  success: 'bg-tag-green-container text-tag-green',
  warning: 'bg-tag-orange-container text-tag-orange',
  danger: 'bg-tag-red-container text-tag-red',
  info: 'bg-tag-blue-container text-tag-blue',
  destructive: 'bg-tag-red-container text-tag-red',
};

const GLYPH_TONE: Record<DialogIconTone, string> = {
  brand: 'text-primary-text',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  destructive: 'text-danger',
};

/* Tinted icon tile, for headers that sit outside a dialog (sheets, panels). */
export function DialogIconTile({
  icon,
  tone = 'brand',
}: {
  icon: ReactNode;
  tone?: DialogIconTone;
}) {
  return (
    <span
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-xl [&>svg]:size-5',
        TILE_TONE[tone],
      )}
      aria-hidden
    >
      {icon}
    </span>
  );
}

/* Bare glyph in the tone colour, as the dialog frames draw it (no tile).
   The frames colour a neutral dialog's glyph green (03.02, 04.03, 13.02,
   19.02), so `success` is the default tone; destructive dialogs use `danger`. */
export function DialogIcon({ icon, tone = 'brand' }: { icon: ReactNode; tone?: DialogIconTone }) {
  return (
    <span
      data-slot="dialog-icon"
      data-tone={tone}
      className={cn(
        'inline-flex size-6 shrink-0 items-center justify-center [&>svg]:size-5',
        GLYPH_TONE[tone],
      )}
      aria-hidden
    >
      {icon}
    </span>
  );
}

export interface DialogHeadingProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  iconTone?: DialogIconTone;
  iconLayout?: DialogIconLayout;
  reserveClose?: boolean;
}

/* Header shared by DialogLayout and ConfirmDialog: optional icon, title, subtitle. */
export function DialogHeading({
  title,
  description,
  icon,
  iconTone = 'success',
  iconLayout = 'inline',
  reserveClose = false,
}: DialogHeadingProps) {
  return (
    <DialogHeader
      reserveClose={reserveClose}
      data-icon-layout={icon ? iconLayout : undefined}
      className={cn(
        icon && iconLayout === 'inline' && 'gap-inline flex-row items-start',
        icon && iconLayout === 'stacked' && 'gap-row',
      )}
    >
      {icon ? <DialogIcon icon={icon} tone={iconTone} /> : null}
      <div className="gap-field flex min-w-0 flex-col">
        <DialogTitle className="text-h3 text-text-primary">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="text-b2 text-text-secondary">
            {description}
          </DialogDescription>
        ) : null}
      </div>
    </DialogHeader>
  );
}

export interface DialogLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  iconTone?: DialogIconTone;
  iconLayout?: DialogIconLayout;
  footer?: ReactNode;
  size?: DialogSize;
  className?: string;
  /**
   * Corner close (X). Off by default when a footer exists (the frames show
   * none; the footer's cancel, Escape and the overlay close the dialog).
   * A dialog without a footer keeps it so there is always a way out.
   */
  showCloseButton?: boolean;
  children: ReactNode;
}

export function DialogLayout({
  open,
  onOpenChange,
  title,
  description,
  icon,
  iconTone = 'success',
  iconLayout = 'inline',
  footer,
  size = 'md',
  className,
  showCloseButton,
  children,
}: DialogLayoutProps) {
  const showClose = showCloseButton ?? !footer;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size} className={className} showCloseButton={showClose}>
        <DialogHeading
          title={title}
          description={description}
          icon={icon}
          iconTone={iconTone}
          iconLayout={iconLayout}
          reserveClose={showClose}
        />
        <DialogBody>{children}</DialogBody>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
