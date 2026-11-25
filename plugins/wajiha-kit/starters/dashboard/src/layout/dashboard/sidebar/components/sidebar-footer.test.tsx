import { describe, expect, it } from 'vitest';
import { env } from '@/env';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { SidebarFooter } from './sidebar-footer';

describe('SidebarFooter', () => {
  it('renders the version and the status label', () => {
    renderWithProviders(<SidebarFooter />);
    expect(screen.getByText(`v${env.VITE_APP_VERSION}`)).toBeInTheDocument();
    expect(screen.getByText(tt('shell.status'))).toBeInTheDocument();
  });

  it('renders the Arabic status label', async () => {
    await setTestLanguage('ar');
    renderWithProviders(<SidebarFooter />);
    expect(screen.getByText(tt('shell.status'))).toBeInTheDocument();
  });

  it('renders only the status dot with an accessible name when collapsed', () => {
    renderWithProviders(<SidebarFooter collapsed />);
    expect(
      screen.getByRole('img', { name: tt('shell.status') }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(`v${env.VITE_APP_VERSION}`),
    ).not.toBeInTheDocument();
  });
});
