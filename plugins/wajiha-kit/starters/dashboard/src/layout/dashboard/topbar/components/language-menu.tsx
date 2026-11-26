import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LANGUAGE_CODES,
  LANGUAGES,
  type SupportedLanguage,
} from '@/lib/i18n/languages';
import { Check, Globe } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface LanguageMenuProps {
  language: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}

const OPTIONS = LANGUAGE_CODES.map((value) => ({
  value,
  nameKey: LANGUAGES[value].nameKey,
}));

export function LanguageMenu({
  language,
  onChange,
}: LanguageMenuProps): ReactElement {
  const { t } = useTranslation();
  const currentName = t(LANGUAGES[language].nameKey);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t('common.language')}: ${currentName}`}
        data-slot="language-trigger"
        className="topbar-chip"
      >
        <Globe aria-hidden className="size-[18px]" />
        <span className="max-md:sr-only">{currentName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-h4 text-text-primary">
            {t('shell.language.menuTitle')}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        {OPTIONS.map((item) => {
          const isCurrent = item.value === language;
          return (
            <DropdownMenuItem
              key={item.value}
              aria-current={isCurrent || undefined}
              onClick={() => {
                if (!isCurrent) {
                  onChange(item.value);
                }
              }}
              className={cn('text-b1 h-10', isCurrent && 'bg-primary-light')}
            >
              <span className="flex-1">
                {t(item.nameKey)}
                {isCurrent ? ` — ${t('shell.language.current')}` : ''}
              </span>
              {isCurrent ? <Check aria-hidden className="size-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
