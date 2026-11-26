import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { XIcon } from '@/components/ui/icons';
import { directionOf, toLocale } from '@/shared/lib/i18n/languages';
import { cn } from '@/shared/utils/cn';

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-(--scrim) backdrop-blur-[12px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

type SheetSide = 'top' | 'bottom' | 'inline-start' | 'inline-end' | 'left' | 'right';

const sheetSurface =
  'fixed z-50 flex flex-col gap-4 border-(--stroke-strong) bg-(--surface-elevated) bg-clip-padding text-sm text-(--text-primary) shadow-(--shadow-xlarge) transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=inline-start]:inset-y-0 data-[side=inline-start]:start-0 data-[side=inline-start]:h-full data-[side=inline-start]:w-3/4 data-[side=inline-start]:border-e data-[side=inline-start]:sm:max-w-sm data-[side=inline-end]:inset-y-0 data-[side=inline-end]:end-0 data-[side=inline-end]:h-full data-[side=inline-end]:w-3/4 data-[side=inline-end]:border-s data-[side=inline-end]:sm:max-w-sm data-[side=inline-start]:data-starting-style:-translate-x-full data-[side=inline-start]:data-ending-style:-translate-x-full rtl:data-[side=inline-start]:data-starting-style:translate-x-full rtl:data-[side=inline-start]:data-ending-style:translate-x-full data-[side=inline-end]:data-starting-style:translate-x-full data-[side=inline-end]:data-ending-style:translate-x-full rtl:data-[side=inline-end]:data-starting-style:-translate-x-full rtl:data-[side=inline-end]:data-ending-style:-translate-x-full';

/**
 * Physical `left`/`right` are aliases resolved against the current direction:
 * `right` is the start edge in Arabic (RTL) and the end edge in English (LTR).
 */
function toLogicalSide(side: SheetSide, dir: 'ltr' | 'rtl'): Exclude<SheetSide, 'left' | 'right'> {
  const isRtl = dir === 'rtl';
  if (side === 'left') {
    return isRtl ? 'inline-end' : 'inline-start';
  }
  if (side === 'right') {
    return isRtl ? 'inline-start' : 'inline-end';
  }
  return side;
}

function SheetContent({
  className,
  children,
  side = 'inline-end',
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: SheetSide;
  showCloseButton?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const dir = directionOf(toLocale(i18n.language));
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={toLogicalSide(side, dir)}
        className={cn(sheetSurface, className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={<Button variant="ghost" className="absolute end-4 top-4" size="icon-sm" />}
          >
            <XIcon />
            <span className="sr-only">{t('ui.close')}</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-h3 text-(--text-primary)', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-b2 text-(--text-secondary)', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
