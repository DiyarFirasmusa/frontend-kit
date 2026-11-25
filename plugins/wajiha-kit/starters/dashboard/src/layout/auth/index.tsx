import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { directionOf } from '@/lib/i18n/languages';
import { AuthBrandPanel } from './components/auth-brand-panel';
import { AuthLanguageSwitcher } from './components/auth-language-switcher';
import { AuthThemeToggle } from './components/auth-theme-toggle';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t, i18n } = useTranslation();
  const dir = directionOf(i18n.language);

  return (
    <div
      dir={dir}
      className="bg-background grid min-h-svh place-items-center p-4 md:p-6"
    >
      <div className="border-stroke bg-surface shadow-large rounded-modal grid w-full max-w-[72rem] overflow-hidden border lg:min-h-[40rem] lg:grid-cols-2">
        <AuthBrandPanel />
        <main className="bg-surface p-card flex flex-col">
          <div className="mb-card flex flex-wrap justify-end gap-2">
            <AuthLanguageSwitcher />
            <AuthThemeToggle />
          </div>
          <h1 className="text-h2 mb-card lg:hidden">
            {t('shell.brand.title')}
          </h1>
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center lg:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
