import { afterEach, describe, expect, it } from 'vitest';
import i18n from '@/lib/i18n/i18n';
import { tt } from '@/test/i18n';
import { renderWithProviders, screen, waitFor, within } from '@/test/render';
import { AuthLanguageSwitcher } from './auth-language-switcher';

describe('AuthLanguageSwitcher', () => {
  afterEach(async () => {
    if (i18n.language !== 'en') {
      await i18n.changeLanguage('en');
    }
  });

  it('renders both language options with English active by default', () => {
    renderWithProviders(<AuthLanguageSwitcher />);

    const group = screen.getByRole('group', { name: tt('common.language') });
    expect(
      within(group).getByRole('button', { name: 'English' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(group).getByRole('button', { name: 'العربية' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('marks each native label with its own lang attribute', () => {
    renderWithProviders(<AuthLanguageSwitcher />);

    expect(screen.getByRole('button', { name: 'العربية' })).toHaveAttribute(
      'lang',
      'ar',
    );
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'lang',
      'en',
    );
  });

  it('switches the active language to Arabic on click', async () => {
    const { user } = renderWithProviders(<AuthLanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: 'العربية' }));

    await waitFor(() => {
      expect(i18n.resolvedLanguage ?? i18n.language).toBe('ar');
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'العربية' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  });
});
