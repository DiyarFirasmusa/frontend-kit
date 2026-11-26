import { describe, expect, it, vi } from 'vitest';
import { deferred } from '@/test/deferred';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { ConfirmDialog } from './confirm-dialog';

interface Options {
  isLoading?: boolean;
  destructive?: boolean;
}

function renderConfirm({ isLoading = false, destructive = false }: Options) {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();
  const utils = renderWithProviders(
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      title="Approve document"
      description="This cannot be undone."
      onConfirm={onConfirm}
      isLoading={isLoading}
      destructive={destructive}
    />,
  );
  return { ...utils, onConfirm, onOpenChange };
}

describe('ConfirmDialog', () => {
  it('renders the title, description and default labels', () => {
    renderConfirm({});

    expect(
      screen.getByRole('heading', { name: 'Approve document' }),
    ).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: tt('common.confirm') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: tt('common.cancel') }),
    ).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is pressed', async () => {
    const { user, onConfirm } = renderConfirm({});

    await user.click(
      screen.getByRole('button', { name: tt('common.confirm') }),
    );
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('shows a loader, aria-busy and disables actions while loading', () => {
    renderConfirm({ isLoading: true });

    const confirm = screen.getByRole('button', { name: tt('common.confirm') });
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(confirm).toBeDisabled();
    expect(confirm.querySelector('svg')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: tt('common.cancel') }),
    ).toBeDisabled();
  });

  it('hides the close button while loading', () => {
    renderConfirm({ isLoading: true });

    expect(
      screen.queryByRole('button', { name: tt('common.close') }),
    ).not.toBeInTheDocument();
  });

  it('has no corner close button; cancel and Escape close it', async () => {
    const { user, onOpenChange } = renderConfirm({});

    expect(
      screen.queryByRole('button', { name: tt('common.close') }),
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    onOpenChange.mockClear();
    await user.click(screen.getByRole('button', { name: tt('common.cancel') }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('puts the confirm action before cancel', () => {
    renderConfirm({});

    const confirm = screen.getByRole('button', { name: tt('common.confirm') });
    const cancel = screen.getByRole('button', { name: tt('common.cancel') });
    expect(
      confirm.compareDocumentPosition(cancel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('uses the destructive style for the confirm button', () => {
    renderConfirm({ destructive: true });

    expect(
      screen.getByRole('button', { name: tt('common.confirm') }),
    ).toHaveClass('btn-soft-danger');
  });

  it('uses the default style for the confirm button when not destructive', () => {
    renderConfirm({});

    expect(
      screen.getByRole('button', { name: tt('common.confirm') }),
    ).not.toHaveClass('btn-soft-danger');
  });

  it('localises the default labels in Arabic', async () => {
    renderConfirm({});
    await setTestLanguage('ar');

    expect(
      screen.getByRole('button', { name: tt('common.confirm') }),
    ).toBeInTheDocument();
    await setTestLanguage('en');
  });

  it('is an alert dialog with focus on Cancel when destructive', async () => {
    renderConfirm({ destructive: true });

    const dialog = screen.getByRole('alertdialog', {
      name: 'Approve document',
    });
    expect(dialog).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: tt('common.cancel') }),
      ).toHaveFocus();
    });
  });

  it('stays a plain dialog when not destructive', () => {
    renderConfirm({});

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('confirms once per request however often the button is pressed', async () => {
    const { user, onConfirm } = renderConfirm({ destructive: true });
    const confirm = screen.getByRole('button', { name: tt('common.confirm') });

    await user.click(confirm);
    await user.click(confirm);
    await user.click(confirm);

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('stays open and busy until a returned promise settles', async () => {
    const gate = deferred();
    const onConfirm = vi.fn(() => gate.promise);
    const onOpenChange = vi.fn();
    const { user } = renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Delete warehouse"
        onConfirm={onConfirm}
        destructive
      />,
    );
    const confirm = screen.getByRole('button', { name: tt('common.confirm') });

    await user.click(confirm);
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();

    gate.resolve();
    await waitFor(() => {
      expect(confirm).not.toHaveAttribute('aria-busy', 'true');
    });
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });
});
