import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { XIcon } from '@/components/ui/icons';
import { cn } from '@/shared/utils/cn';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

const dialogSizes: Record<DialogSize, string> = {
  sm: 'w-[min(420px,95vw)] sm:max-w-[420px]',
  md: 'w-[min(640px,95vw)] sm:max-w-[640px]',
  lg: 'w-[min(900px,95vw)] sm:max-w-[900px]',
  xl: 'w-[min(1100px,95vw)] sm:max-w-[1100px]',
};

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-(--scrim) backdrop-blur-[12px] duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = 'md',
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  size?: DialogSize;
}) {
  const { t } = useTranslation();
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 start-1/2 z-50 flex max-h-[85vh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-(--radius-modal) border border-(--stroke-strong) bg-(--surface-elevated) text-sm text-(--text-primary) shadow-(--shadow-xlarge) duration-100 outline-none rtl:translate-x-1/2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          dialogSizes[size],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="ghost" className="absolute end-4 top-4 z-10" size="icon-sm" />}
          >
            <XIcon />
            <span className="sr-only">{t('ui.close')}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  padded = true,
  reserveClose = true,
  ...props
}: React.ComponentProps<'div'> & {
  padded?: boolean;
  /** Keeps room at the end for the corner close button. */
  reserveClose?: boolean;
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex shrink-0 flex-col gap-1.5',
        padded && 'p-6 pb-4',
        padded && (reserveClose ? 'pe-14' : 'pe-6'),
        className,
      )}
      {...props}
    />
  );
}

function DialogBody({
  className,
  padded = true,
  ...props
}: React.ComponentProps<'div'> & { padded?: boolean }) {
  return (
    <div
      data-slot="dialog-body"
      className={cn('custom-scrollbar flex-1 overflow-y-auto', padded && 'px-6 pb-6', className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  padded = true,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  padded?: boolean;
  showCloseButton?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex shrink-0 flex-col gap-2 bg-(--surface-elevated) sm:flex-row sm:flex-wrap sm:justify-start',
        padded && 'px-6 pt-2 pb-6',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          {t('ui.close')}
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-h3 text-(--text-primary)', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-b2 text-(--text-secondary) *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-(--text-primary)',
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
