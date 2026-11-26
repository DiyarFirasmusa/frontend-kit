import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  isSupportedLanguage,
  LANGUAGE_CODES,
  LANGUAGES,
  type SupportedLanguage,
} from '@/lib/i18n/languages';
import { ChevronDown, LogOut } from '@/lib/icons';
import { PHONE_QUERY, useMediaQuery } from '../hooks/use-media-query';

type ThemeValue = 'light' | 'dark';

interface AccountMenuProps {
  displayName: string;
  roleLabel: string;
  orgUnitName: string | null;
  avatarUrl: string | null;
  initials: string;
  onLogout: () => void;
  /** Theme and language show inside the menu on phones only, where the bar has no room for them. */
  theme?: ThemeValue;
  onThemeChange?: (theme: ThemeValue) => void;
  language?: SupportedLanguage;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

const THEMES: readonly { value: ThemeValue; labelKey: string }[] = [
  { value: 'light', labelKey: 'common.light' },
  { value: 'dark', labelKey: 'common.dark' },
];

function isTheme(value: unknown): value is ThemeValue {
  return value === 'light' || value === 'dark';
}

function PhonePreferences({
  theme,
  onThemeChange,
  language,
  onLanguageChange,
}: Pick<
  AccountMenuProps,
  'theme' | 'onThemeChange' | 'language' | 'onLanguageChange'
>): ReactElement {
  const { t } = useTranslation();
  return (
    <>
      {theme && onThemeChange ? (
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-label text-text-secondary">
            {t('common.theme')}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(next) => {
              if (isTheme(next)) {
                onThemeChange(next);
              }
            }}
          >
            {THEMES.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="text-b1 h-10"
              >
                {t(option.labelKey)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      ) : null}
      {language && onLanguageChange ? (
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-label text-text-secondary">
            {t('common.language')}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={language}
            onValueChange={(next) => {
              if (isSupportedLanguage(next) && next !== language) {
                onLanguageChange(next);
              }
            }}
          >
            {LANGUAGE_CODES.map((value) => (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                className="text-b1 h-10"
              >
                {t(LANGUAGES[value].nameKey)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      ) : null}
      <DropdownMenuSeparator />
    </>
  );
}

export function AccountMenu({
  displayName,
  roleLabel,
  orgUnitName,
  avatarUrl,
  initials,
  onLogout,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
}: AccountMenuProps): ReactElement {
  const { t } = useTranslation();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const subtitle = [roleLabel, orgUnitName]
    .filter((part) => part && part !== '—')
    .join(' • ');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="account-trigger"
        className="topbar-chip topbar-chip-soft max-md:px-field min-w-0 text-start max-md:min-h-10"
      >
        <UserAvatar
          src={avatarUrl}
          initials={initials}
          className="text-button-2 size-8 rounded-lg"
        />
        <span className="flex min-w-0 flex-col leading-tight max-md:sr-only">
          <span className="text-button-2 text-text-primary truncate">
            {displayName}
          </span>
          <span className="text-b3 text-text-secondary truncate">
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className="text-text-secondary size-4 shrink-0 max-md:hidden"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="text-h4 text-text-primary">{displayName}</span>
            {subtitle ? (
              <span className="text-b3 text-text-secondary font-normal">
                {subtitle}
              </span>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {isPhone ? (
          <PhonePreferences
            theme={theme}
            onThemeChange={onThemeChange}
            language={language}
            onLanguageChange={onLanguageChange}
          />
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          className="text-b1 h-10"
          onClick={onLogout}
        >
          <LogOut className="size-4" /> {t('common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
