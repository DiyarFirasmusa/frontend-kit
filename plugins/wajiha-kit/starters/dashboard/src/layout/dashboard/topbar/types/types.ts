import type { SupportedLanguage } from '@/lib/i18n/i18n';
import type {
  NotificationPageResponse,
  NotificationResponse,
} from '@/types/api/notifications';

export interface TopbarState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  displayName: string;
  jobTitle: string | null;
  orgUnitName: string | null;
  avatarUrl: string | null;
  firstRole: string;
  initials: string;
  logout: () => void;
}

export type GlobalSearchGroup =
  | 'warehouses'
  | 'suppliers'
  | 'categories'
  | 'units';

export interface GlobalSearchOption {
  id: string;
  group: GlobalSearchGroup;
  title: string | null;
  subtitle: string | null;
  /** Shown as a small badge when the record is switched off. */
  inactive: boolean;
}

export interface SearchHit {
  id: string;
  code: string | null;
  name: string | null;
  isActive: boolean | null;
}

export type GlobalSearchResponse = Record<GlobalSearchGroup, SearchHit[]>;

export type GlobalSearchStatus = 'loading' | 'error' | 'empty' | 'results';

export interface GlobalSearchSection {
  group: GlobalSearchGroup;
  options: { option: GlobalSearchOption; index: number }[];
}

export interface NotificationListParams {
  page: number;
  size: number;
}

export type NotificationTarget =
  | { to: '/warehouses/$warehouseId'; params: { warehouseId: string } }
  | { to: '/warehouses' }
  | { to: '/suppliers' }
  | { to: '/categories' }
  | { to: '/units-of-measure' };

export interface NotificationsMenuState {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: NotificationPageResponse | undefined;
  retry: () => void;
  onSelect: (notification: NotificationResponse) => void;
  onMarkAllRead: () => void;
  isMarkingAllRead: boolean;
}
