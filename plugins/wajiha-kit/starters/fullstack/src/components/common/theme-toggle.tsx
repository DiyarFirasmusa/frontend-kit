import { useTranslation } from 'react-i18next';
import { MoonIcon, SunIcon } from '@/components/common/icons';
import { useThemeStore } from '@/shared/store/theme-store';

export function ThemeToggle() {
  const { t } = useTranslation();
  const toggle = useThemeStore((state) => state.toggle);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('common.switchTheme')}
      className="border-stroke bg-surface text-text-primary hover:bg-muted inline-flex size-11 items-center justify-center rounded-md border"
    >
      <SunIcon className="theme-icon-light" />
      <MoonIcon className="theme-icon-dark" />
    </button>
  );
}
