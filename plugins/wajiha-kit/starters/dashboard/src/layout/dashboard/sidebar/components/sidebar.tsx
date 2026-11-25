import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar-store';
import { useSidebar } from '../hooks/use-sidebar';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarNav } from './sidebar-nav';

export function DashboardSidebar() {
  const { path } = useSidebar();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggle = useSidebarStore((state) => state.toggle);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        'bg-sidebar text-sidebar-foreground border-sidebar-border py-row gap-row sticky top-0 hidden h-svh shrink-0 flex-col overflow-x-hidden border-s transition-[width] duration-200 motion-reduce:transition-none md:flex',
        collapsed ? 'w-16 px-2' : 'w-[244px] px-3',
      )}
    >
      <SidebarHeader collapsed={collapsed} onToggleCollapse={toggle} />
      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        <SidebarNav
          path={path}
          collapsed={collapsed}
          onExpand={() => {
            setCollapsed(false);
          }}
        />
      </div>
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
