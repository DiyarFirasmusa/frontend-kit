import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/theme-provider';
import { Moon, Sun, type IconComponent } from '@/lib/icons';
import { cn } from '@/lib/utils';

type ThemeOptionValue = 'light' | 'dark';

const THEME_OPTIONS: readonly {
  value: ThemeOptionValue;
  labelKey: string;
  icon: IconComponent;
}[] = [
  { value: 'light', labelKey: 'common.light', icon: Sun },
  { value: 'dark', labelKey: 'common.dark', icon: Moon },
];

export function AuthThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme, mounted } = useTheme();

  return (
    <div
      role="group"
      aria-label={t('common.theme')}
      className="border-stroke bg-secondary rounded-pill inline-flex items-center gap-0.5 border p-0.5"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              setTheme(option.value);
            }}
            className={cn(
              'text-button-2 gap-field inline-flex h-8 items-center rounded-pill px-3 transition-colors focus-visible:ring-primary-highlight focus-visible:outline-none focus-visible:ring-2',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <Icon className="size-4" />
            <span className="sr-only sm:not-sr-only">{t(option.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
