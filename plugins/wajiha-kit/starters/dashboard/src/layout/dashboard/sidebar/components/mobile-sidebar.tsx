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

export function MobileSidebar() {
  const { t, i18n } = useTranslation();
  const { path } = useSidebar();
  const [open, setOpen] = useState(false);

  return (
    <header
      data-slot="mobile-header"
      className="bg-sidebar text-sidebar-foreground sticky top-0 z-30 flex h-[72px] items-center gap-3 px-4 md:hidden"
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0',
          )}
          data-slot="button"
        >
          <Menu className="size-5" />
          <span className="sr-only">{t('common.open')}</span>
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

      <div className="gap-inline flex min-w-0 flex-1 items-center">
        <Cube aria-hidden className="text-warning size-5 shrink-0" />
        <span className="text-h5 truncate">{t('shell.sidebar.title')}</span>
      </div>
    </header>
  );
}
