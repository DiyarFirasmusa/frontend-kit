import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/lib/i18n/i18n';
import { LANGUAGE_CODES, LANGUAGES } from '@/lib/i18n/languages';
import { cn } from '@/lib/utils';

const OPTIONS = LANGUAGE_CODES.map((code) => ({
  code,
  label: LANGUAGES[code].label,
}));

export function AuthLanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const active = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className="border-stroke bg-secondary rounded-pill inline-flex items-center gap-0.5 border p-0.5"
    >
      {OPTIONS.map((lang) => {
        const isActive = active === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            lang={lang.code}
            aria-pressed={isActive}
            onClick={() => {
              void setLanguage(lang.code);
            }}
            className={cn(
              'text-button-2 h-8 rounded-pill px-3 transition-colors focus-visible:ring-primary-highlight focus-visible:outline-none focus-visible:ring-2',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
