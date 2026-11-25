import { describe, expect, it } from 'vitest';
import { renderWithRouter, screen } from '@/test/render';
import { DashboardLayout } from './index';

describe('DashboardLayout', () => {
  it('renders children inside <main>', async () => {
    await renderWithRouter(
      <DashboardLayout>
        <p>page content</p>
      </DashboardLayout>,
      { path: '/' },
    );

    expect(screen.getByRole('main')).toHaveTextContent('page content');
    expect(screen.getAllByRole('banner').length).toBeGreaterThan(0);
  });

  it('renders the user menu trigger in the layout', async () => {
    await renderWithRouter(
      <DashboardLayout>
        <p>page content</p>
      </DashboardLayout>,
      { path: '/' },
    );

    expect(screen.getByRole('button', { name: /—/ })).toBeInTheDocument();
  });
});
