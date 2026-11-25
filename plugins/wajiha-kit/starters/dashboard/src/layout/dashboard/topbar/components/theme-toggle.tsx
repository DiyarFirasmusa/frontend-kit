import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, type IconComponent } from '@/lib/icons';
import { cn } from '@/lib/utils';

type ThemeValue = 'light' | 'dark';

interface ThemeToggleProps {
  theme: ThemeValue;
  onChange: (theme: ThemeValue) => void;
}

const THEME_OPTIONS: readonly {
  value: ThemeValue;
  labelKey: string;
  icon: IconComponent;
}[] = [
  { value: 'light', labelKey: 'common.light', icon: Sun },
  { value: 'dark', labelKey: 'common.dark', icon: Moon },
];

export function ThemeToggle({
  theme,
  onChange,
}: ThemeToggleProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div
      dir="ltr"
      role="group"
      aria-label={t('common.theme')}
      className="border-sidebar-border bg-surface-solid-secondary flex h-[38px] items-center gap-0.5 rounded-xl border p-1"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            aria-label={t(option.labelKey)}
            onClick={() => {
              onChange(option.value);
            }}
            className={cn(
              'focus-visible:outline-primary-highlight flex h-[28px] w-10 items-center justify-center rounded-[9px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
              isActive
                ? 'bg-primary-container text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <Icon aria-hidden className="size-[15px]" />
          </button>
        );
      })}
    </div>
  );
}
