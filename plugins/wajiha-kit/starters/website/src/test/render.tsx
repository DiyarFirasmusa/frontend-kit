import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createI18n } from '@/shared/lib/i18n/create-i18n';
import type { Locale } from '@/shared/lib/i18n/languages';

/** Renders with a fresh per-test i18n instance in the given language (the same shape the router provides). */
export function renderWithI18n(ui: ReactElement, locale: Locale = 'en'): RenderResult {
  return render(<I18nextProvider i18n={createI18n(locale)}>{ui}</I18nextProvider>);
}
