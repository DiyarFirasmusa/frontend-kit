import { describe, expect, it } from 'vitest';
import { tt } from '@/test/i18n';
import { renderWithProviders, screen, waitFor, within } from '@/test/render';
import { AuthThemeToggle } from './auth-theme-toggle';

describe('AuthThemeToggle', () => {
  it('renders a labelled group and follows the OS (light in jsdom) until a choice is made', async () => {
    renderWithProviders(<AuthThemeToggle />);

    const group = screen.getByRole('group', { name: tt('common.theme') });
    const light = within(group).getByRole('button', {
      name: tt('common.light'),
    });
    const dark = within(group).getByRole('button', { name: tt('common.dark') });

    await waitFor(() => {
      expect(light).toHaveAttribute('aria-pressed', 'true');
    });
    expect(dark).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches the pressed option when another theme is chosen', async () => {
    const { user } = renderWithProviders(<AuthThemeToggle />);

    const group = screen.getByRole('group', { name: tt('common.theme') });
    const dark = within(group).getByRole('button', { name: tt('common.dark') });

    await user.click(dark);

    await waitFor(() => {
      expect(dark).toHaveAttribute('aria-pressed', 'true');
    });
    expect(
      within(group).getByRole('button', { name: tt('common.light') }),
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
