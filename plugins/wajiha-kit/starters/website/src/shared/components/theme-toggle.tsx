import { useTranslation } from 'react-i18next';
import { MoonIcon, SunIcon } from '@/shared/components/icons';
import { toggleTheme } from '@/shared/utils/theme';

export function ThemeToggle() {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t('common.switchTheme')}
      className="border-border bg-surface text-text hover:bg-surface-sunken inline-flex size-11 items-center justify-center rounded-md border"
    >
      <SunIcon className="theme-icon-light" />
      <MoonIcon className="theme-icon-dark" />
    </button>
  );
}
