import { afterEach, describe, expect, it } from 'vitest';
import i18n from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, waitFor, within } from '@/test/render';
import { AuthLayout } from './index';

function getBrandAside(container: HTMLElement): HTMLElement {
  const aside = container.querySelector('aside');
  if (!aside) {
    throw new Error('AuthLayout must render the brand aside');
  }
  return aside;
}

describe('AuthLayout', () => {
  afterEach(async () => {
    if (i18n.language !== 'en') {
      await i18n.changeLanguage('en');
    }
  });

  it('renders the children content inside a main landmark', () => {
    const { container } = renderWithProviders(
      <AuthLayout>
        <p>form content</p>
      </AuthLayout>,
    );

    expect(screen.getByText('form content')).toBeInTheDocument();
    expect(container.querySelector('main')).toContainElement(
      screen.getByText('form content'),
    );
  });

  it('renders the brand heading in the aside and a mobile heading in main', () => {
    const { container } = renderWithProviders(
      <AuthLayout>
        <p>form content</p>
      </AuthLayout>,
    );

    expect(
      within(getBrandAside(container)).getByRole('heading', {
        name: tt('shell.brand.title'),
      }),
    ).toBeInTheDocument();
    expect(
      within(container.querySelector('main') as HTMLElement).getByRole(
        'heading',
        { level: 1, name: tt('shell.brand.title') },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('form content')).toBeInTheDocument();
  });

  it('renders the brand panel before the form in DOM order', () => {
    const { container } = renderWithProviders(
      <AuthLayout>
        <p>form content</p>
      </AuthLayout>,
    );

    const formNode = screen.getByText('form content');
    const brandHeading = within(getBrandAside(container)).getByRole('heading', {
      name: tt('shell.brand.title'),
    });
    expect(
      brandHeading.compareDocumentPosition(formNode) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('renders exactly one language switcher and one theme toggle', () => {
    renderWithProviders(
      <AuthLayout>
        <p>form content</p>
      </AuthLayout>,
    );

    expect(screen.getAllByRole('button', { name: 'English' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'العربية' })).toHaveLength(1);
    expect(
      screen.getAllByRole('group', { name: tt('common.theme') }),
    ).toHaveLength(1);
  });

  it('switches the language and the theme from the header controls', async () => {
    const { user } = renderWithProviders(
      <AuthLayout>
        <p>form content</p>
      </AuthLayout>,
    );

    const themes = screen.getByRole('group', { name: tt('common.theme') });
    const light = within(themes).getByRole('button', {
      name: tt('common.light'),
    });
    await user.click(light);
    await waitFor(() => {
      expect(light).toHaveAttribute('aria-pressed', 'true');
    });

    await user.click(screen.getByRole('button', { name: 'العربية' }));
    await waitFor(() => {
      expect(i18n.resolvedLanguage ?? i18n.language).toBe('ar');
    });
  });

  it('sets the root direction to rtl and renders Arabic brand copy', async () => {
    await setTestLanguage('ar');
    const { container } = renderWithProviders(
      <AuthLayout>
        <p>form content</p>
      </AuthLayout>,
    );

    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');
    expect(
      within(getBrandAside(container)).getByRole('heading', {
        name: 'لوحة التحكم',
      }),
    ).toBeInTheDocument();
  });
});
