import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { AuthBrandPanel } from './auth-brand-panel';

describe('AuthBrandPanel', () => {
  it('renders the brand copy in English', () => {
    renderWithProviders(<AuthBrandPanel />);

    expect(screen.getByText(tt('authBrand.logoMark'))).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: tt('shell.brand.title') }),
    ).toBeInTheDocument();
    expect(screen.getByText(tt('shell.brand.subtitle'))).toBeInTheDocument();
    expect(screen.getByText(tt('authBrand.body'))).toBeInTheDocument();
    expect(screen.getByText(tt('authBrand.tagline'))).toBeInTheDocument();
  });

  it('renders the panel as an aside landmark', () => {
    const { container } = renderWithProviders(<AuthBrandPanel />);

    expect(container.querySelector('aside')).toBeInTheDocument();
  });

  it('places the logo tile before the title heading in DOM order', () => {
    renderWithProviders(<AuthBrandPanel />);

    const logoTile = screen.getByText(tt('authBrand.logoMark'));
    const heading = screen.getByRole('heading', {
      name: tt('shell.brand.title'),
    });
    expect(
      logoTile.compareDocumentPosition(heading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('renders the brand copy in Arabic', async () => {
    await setTestLanguage('ar');
    renderWithProviders(<AuthBrandPanel />);

    expect(
      screen.getByRole('heading', { name: 'لوحة التحكم' }),
    ).toBeInTheDocument();
    expect(screen.getByText('لوحة الإدارة')).toBeInTheDocument();
    expect(screen.getByText(tt('authBrand.body'))).toBeInTheDocument();
    expect(screen.getByText(tt('authBrand.tagline'))).toBeInTheDocument();
  });
});
