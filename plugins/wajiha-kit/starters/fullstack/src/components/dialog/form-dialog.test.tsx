import { waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { FormDialog } from './form-dialog';

const submitSpy = vi.fn();

const onOpenChangeSpy = vi.fn();

function FormDialogHarness({
  initialCanSubmit = true,
  initialPending = false,
}: {
  initialCanSubmit?: boolean;
  initialPending?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [canSubmit] = useState(initialCanSubmit);
  const [isPending] = useState(initialPending);

  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChangeSpy(next);
        setOpen(next);
      }}
      title="Test form"
      isPending={isPending}
      canSubmit={canSubmit}
      onSubmit={submitSpy}
    >
      <input aria-label="note" name="note" defaultValue="hello" />
    </FormDialog>
  );
}

describe('FormDialog', () => {
  it('renders cancel and save footer actions', () => {
    submitSpy.mockClear();
    renderWithProviders(<FormDialogHarness />);
    expect(screen.getByRole('button', { name: tt('ui.cancel') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: tt('ui.save') })).toBeInTheDocument();
  });

  it('disables submit when canSubmit is false or pending', () => {
    const { unmount } = renderWithProviders(<FormDialogHarness initialCanSubmit={false} />);
    expect(screen.getByRole('button', { name: tt('ui.save') })).toBeDisabled();
    unmount();
    renderWithProviders(<FormDialogHarness initialPending />);
    expect(screen.getByRole('button', { name: tt('ui.save') })).toBeDisabled();
  });

  it('closes on cancel and keeps open while pending', async () => {
    const { user, unmount } = renderWithProviders(<FormDialogHarness />);
    await user.click(screen.getByRole('button', { name: tt('ui.cancel') }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Test form' })).not.toBeInTheDocument();
    });
    unmount();
    renderWithProviders(<FormDialogHarness initialPending />);
    expect(screen.getByRole('button', { name: tt('ui.cancel') })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'Test form' })).toBeInTheDocument();
  });

  it('submits on Enter and shows Arabic cancel label', async () => {
    submitSpy.mockClear();
    const { user } = renderWithProviders(<FormDialogHarness />);
    const input = screen.getByLabelText('note');
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(submitSpy).toHaveBeenCalledTimes(1);
    await setTestLanguage('ar');
    expect(screen.getByRole('button', { name: tt('ui.cancel') })).toBeInTheDocument();
    await setTestLanguage('en');
  });

  it('blocks Escape close while pending and hides the close button', async () => {
    onOpenChangeSpy.mockClear();
    const { user } = renderWithProviders(<FormDialogHarness initialPending />);
    expect(screen.queryByRole('button', { name: tt('ui.close') })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onOpenChangeSpy).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('heading', { name: 'Test form' })).toBeInTheDocument();
  });

  it('blocks overlay close while pending', async () => {
    onOpenChangeSpy.mockClear();
    const { user } = renderWithProviders(<FormDialogHarness initialPending />);
    const overlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]');
    if (!overlay) {
      throw new Error('overlay missing');
    }
    await user.click(overlay);
    expect(onOpenChangeSpy).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('heading', { name: 'Test form' })).toBeInTheDocument();
  });

  it('shows a busy submit button with a loader while pending', () => {
    renderWithProviders(<FormDialogHarness initialPending />);
    const save = screen.getByRole('button', { name: tt('ui.save') });
    expect(save).toHaveAttribute('aria-busy', 'true');
    expect(save.querySelector('svg')).not.toBeNull();
  });

  it('renders the save button before cancel, with no corner close', () => {
    renderWithProviders(<FormDialogHarness />);
    const cancel = screen.getByRole('button', { name: tt('ui.cancel') });
    const save = screen.getByRole('button', { name: tt('ui.save') });
    expect(save.compareDocumentPosition(cancel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole('button', { name: tt('ui.close') })).not.toBeInTheDocument();
  });
});
