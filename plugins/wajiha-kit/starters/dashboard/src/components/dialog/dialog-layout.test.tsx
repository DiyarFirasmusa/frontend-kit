import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { DialogLayout } from './dialog-layout';

describe('DialogLayout', () => {
  it('renders title, description, icon, body and footer', () => {
    renderWithProviders(
      <DialogLayout
        open
        onOpenChange={() => {}}
        title="Move stock"
        description="Pick the destination."
        icon={<span>ICON</span>}
        footer={<button type="button">Confirm move</button>}
      >
        <p>Body content</p>
      </DialogLayout>,
    );

    expect(
      screen.getByRole('heading', { name: 'Move stock' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pick the destination.')).toBeInTheDocument();
    expect(screen.getByText('ICON')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirm move' }),
    ).toBeInTheDocument();
  });

  it('renders without an icon, description or footer', () => {
    renderWithProviders(
      <DialogLayout open onOpenChange={() => {}} title="Plain">
        <p>Only body</p>
      </DialogLayout>,
    );

    expect(screen.getByRole('heading', { name: 'Plain' })).toBeInTheDocument();
    expect(screen.getByText('Only body')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="dialog-footer"]')).toBeNull();
    expect(
      document.querySelector('[data-slot="dialog-description"]'),
    ).toBeNull();
  });

  it('hides the corner close when a footer exists and keeps it otherwise', () => {
    const { unmount } = renderWithProviders(
      <DialogLayout
        open
        onOpenChange={() => {}}
        title="With footer"
        footer={<button type="button">Done</button>}
      >
        <p>Body</p>
      </DialogLayout>,
    );
    expect(
      screen.queryByRole('button', { name: tt('common.close') }),
    ).not.toBeInTheDocument();
    unmount();

    renderWithProviders(
      <DialogLayout open onOpenChange={() => {}} title="No footer">
        <p>Body</p>
      </DialogLayout>,
    );
    expect(
      screen.getByRole('button', { name: tt('common.close') }),
    ).toBeInTheDocument();
  });

  it('renders the icon as a toned glyph, inline by default or stacked', () => {
    const { unmount } = renderWithProviders(
      <DialogLayout
        open
        onOpenChange={() => {}}
        title="Inline"
        icon={<svg />}
        iconTone="danger"
      >
        <p>Body</p>
      </DialogLayout>,
    );
    const inlineIcon = document.querySelector('[data-slot="dialog-icon"]');
    expect(inlineIcon).toHaveAttribute('data-tone', 'danger');
    expect(inlineIcon).toHaveAttribute('aria-hidden');
    expect(
      document.querySelector('[data-slot="dialog-header"]'),
    ).toHaveAttribute('data-icon-layout', 'inline');
    unmount();

    renderWithProviders(
      <DialogLayout
        open
        onOpenChange={() => {}}
        title="Stacked"
        icon={<svg />}
        iconLayout="stacked"
      >
        <p>Body</p>
      </DialogLayout>,
    );
    expect(
      document.querySelector('[data-slot="dialog-header"]'),
    ).toHaveAttribute('data-icon-layout', 'stacked');
    expect(document.querySelector('[data-slot="dialog-icon"]')).toHaveAttribute(
      'data-tone',
      'success',
    );
  });

  it('labels the close button in Arabic', async () => {
    await setTestLanguage('ar');
    renderWithProviders(
      <DialogLayout open onOpenChange={() => {}} title="بلا تذييل">
        <p>نص</p>
      </DialogLayout>,
    );
    expect(
      screen.getByRole('button', { name: tt('common.close') }),
    ).toBeInTheDocument();
  });
});
