import { describe, expect, it, vi } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { ErrorPage } from './error-page';

function setup(kind: 'network' | 'server' | 'unexpected' = 'server') {
  const primary = vi.fn();
  const secondary = vi.fn();
  const utils = renderWithProviders(
    <ErrorPage
      kind={kind}
      primary={{ label: tt('errorPages.retry'), onClick: primary }}
      secondary={{ label: tt('errorPages.goHome'), onClick: secondary }}
      details={[
        { label: tt('errorPages.details.status'), value: 500, mono: true },
        { label: tt('errorPages.details.reference'), value: null, mono: true },
      ]}
    />,
  );
  return { ...utils, primary, secondary };
}

describe('ErrorPage', () => {
  it('renders the server error title, alert, details and tips', () => {
    setup('server');

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: tt('errorPages.server.title'),
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      tt('errorPages.server.alertTitle'),
    );
    expect(screen.getByText('500')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText(tt('errorPages.server.tip1'))).toBeInTheDocument();
  });

  it('renders the network and unexpected variants', () => {
    const { unmount } = setup('network');
    expect(
      screen.getByRole('heading', { name: tt('errorPages.network.title') }),
    ).toBeInTheDocument();
    expect(screen.getByText(tt('errorPages.network.tip3'))).toBeInTheDocument();
    unmount();

    setup('unexpected');
    expect(
      screen.getByRole('heading', { name: tt('errorPages.unexpected.title') }),
    ).toBeInTheDocument();
  });

  it('runs the primary and secondary actions', async () => {
    const { user, primary, secondary } = setup();

    await user.click(
      screen.getByRole('button', { name: tt('errorPages.retry') }),
    );
    await user.click(
      screen.getByRole('button', { name: tt('errorPages.goHome') }),
    );

    expect(primary).toHaveBeenCalledTimes(1);
    expect(secondary).toHaveBeenCalledTimes(1);
  });

  it('renders the Arabic copy', async () => {
    await setTestLanguage('ar');
    setup('network');

    expect(
      screen.getByRole('heading', { level: 1, name: 'لا يوجد اتصال بالإنترنت' }),
    ).toBeInTheDocument();
  });
});

describe('ErrorPage extra action', () => {
  it('renders and runs the sign-in-again action when given', async () => {
    const extra = vi.fn();
    const { user } = renderWithProviders(
      <ErrorPage
        kind="unexpected"
        primary={{ label: tt('errorPages.reload'), onClick: vi.fn() }}
        extra={{ label: tt('errorPages.signInAgain'), onClick: extra }}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: tt('errorPages.signInAgain') }),
    );

    expect(extra).toHaveBeenCalledTimes(1);
  });

  it('omits the action when none is given', () => {
    renderWithProviders(
      <ErrorPage
        kind="unexpected"
        primary={{ label: tt('errorPages.reload'), onClick: vi.fn() }}
      />,
    );

    expect(
      screen.queryByRole('button', { name: tt('errorPages.signInAgain') }),
    ).not.toBeInTheDocument();
  });
});
