import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/theme-provider';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-logout';
import { setLanguage as applyLanguage } from '@/lib/i18n/i18n';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/lib/i18n/languages';
import { usePermissionStore } from '@/store/permission-store';
import type { TopbarState } from '../types/types';

const EMPTY = '—';

export function useTopbar(): TopbarState {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { displayName, jobTitle, orgUnitName, avatarUrl, initials } =
    useCurrentUser();
  const firstRole = usePermissionStore((s) => s.roles?.[0]) ?? EMPTY;
  const signOut = useLogout();

  const current = i18n.resolvedLanguage ?? i18n.language;
  const language = isSupportedLanguage(current) ? current : DEFAULT_LANGUAGE;

  return {
    theme,
    setTheme,
    language,
    setLanguage: (next) => {
      void applyLanguage(next);
    },
    displayName,
    jobTitle,
    orgUnitName,
    avatarUrl,
    firstRole,
    initials,
    logout: () => {
      void signOut();
    },
  };
}
