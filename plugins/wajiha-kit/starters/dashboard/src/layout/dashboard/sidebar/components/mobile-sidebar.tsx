import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { directionOf } from '@/lib/i18n/languages';
import { Cube, Menu } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useSidebar } from '../hooks/use-sidebar';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarNav } from './sidebar-nav';

/**
 * The phone end of the top bar: the menu button that opens the navigation
 * sheet, then the brand. Rendered inside DashboardTopbar, so phones get one
 * bar instead of a brand header stacked on the top bar.
 */
export function MobileSidebar({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const { path } = useSidebar();
  const [open, setOpen] = useState(false);

  return (
    <div
      data-slot="mobile-nav"
      className={cn('gap-field flex min-w-0 flex-1 items-center', className)}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            '-ms-2 shrink-0',
          )}
          data-slot="button"
        >
          <Menu className="size-5" />
          <span className="sr-only">{t('shell.sidebar.openMenu')}</span>
        </SheetTrigger>
        <SheetContent
          side={directionOf(i18n.language) === 'rtl' ? 'right' : 'left'}
          className="bg-sidebar text-sidebar-foreground flex w-[244px] flex-col gap-4 p-4"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t('shell.brand.title')}</SheetTitle>
          </SheetHeader>
          <SidebarHeader />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarNav
              path={path}
              onNavigate={() => {
                setOpen(false);
              }}
            />
          </div>
          <SidebarFooter />
        </SheetContent>
      </Sheet>

      <div className="gap-field flex min-w-0 flex-1 items-center">
        <Cube aria-hidden className="text-brand-text size-5 shrink-0" />
        <span className="text-h5 truncate">{t('shell.sidebar.title')}</span>
      </div>
    </div>
  );
}
