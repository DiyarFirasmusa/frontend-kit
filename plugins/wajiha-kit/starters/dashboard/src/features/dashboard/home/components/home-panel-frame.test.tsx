import { describe, expect, it } from 'vitest';
import { setTestLanguage } from '@/test/i18n';
import { renderWithRouter, screen } from '@/test/render';
import { HomePanelFrame } from './home-panel-frame';

describe('HomePanelFrame', () => {
  it('renders the title, subtitle and children', async () => {
    await renderWithRouter(
      <HomePanelFrame title="Activity" subtitle="Last 30 days">
        <p>Panel body</p>
      </HomePanelFrame>,
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Activity' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });

  it('links the view-all label to its route when one is given', async () => {
    await renderWithRouter(
      <HomePanelFrame
        title="Recent"
        viewAll={{ label: 'All suppliers', link: { to: '/suppliers' } }}
      >
        <span>body</span>
      </HomePanelFrame>,
    );
    expect(screen.getByRole('link', { name: 'All suppliers' })).toHaveAttribute(
      'href',
      '/suppliers',
    );
  });

  it('shows no link and no subtitle when none are given', async () => {
    await renderWithRouter(
      <HomePanelFrame title="Drafts">
        <span>body</span>
      </HomePanelFrame>,
    );
    expect(screen.getByRole('heading', { name: 'Drafts' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(document.querySelector('header p')).toBeNull();
  });

  it('renders the aside and can force an LTR layout', async () => {
    await setTestLanguage('ar');
    await renderWithRouter(
      <HomePanelFrame
        title="النشاط"
        layoutDir="ltr"
        aside={<span>legend</span>}
      >
        <span>body</span>
      </HomePanelFrame>,
    );
    expect(screen.getByText('legend')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'النشاط' })).toHaveAttribute(
      'dir',
      'ltr',
    );
    expect(
      screen.getByRole('heading', { name: 'النشاط' }).parentElement,
    ).toHaveAttribute('dir', 'rtl');
  });
});
