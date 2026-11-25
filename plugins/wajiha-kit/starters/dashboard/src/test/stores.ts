import { useAppErrorStore } from '@/store/app-error-store';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { useSidebarStore } from '@/store/sidebar-store';

/** Return every persisted Zustand store to its initial state. */
export function resetStores(): void {
  useAuthStore.getState().clear();
  usePermissionStore.getState().clear();
  useAppErrorStore.getState().clear();
  useSidebarStore.getState().setCollapsed(false);
}
