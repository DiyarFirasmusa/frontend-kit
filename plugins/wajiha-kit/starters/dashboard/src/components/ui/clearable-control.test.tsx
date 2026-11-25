import { describe, expect, it, vi } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { fireEvent, renderWithProviders, screen } from '@/test/render';
import { ClearableControl } from './clearable-control';

function renderControl(canClear: boolean, onClear = vi.fn()) {
  const utils = renderWithProviders(
    <ClearableControl canClear={canClear} onClear={onClear}>
      <button type="button" className="control">
        Warehouse
      </button>
    </ClearableControl>,
  );
  return { ...utils, onClear };
}

describe('ClearableControl', () => {
  it('shows a labelled clear button only while it can clear', () => {
    renderControl(false);
    expect(
      screen.queryByRole('button', { name: tt('common.clearValue') }),
    ).not.toBeInTheDocument();
  });

  it('clears on click and moves focus back to the trigger', async () => {
    const { user, onClear } = renderControl(true);

    await user.click(
      screen.getByRole('button', { name: tt('common.clearValue') }),
    );

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Warehouse' })).toHaveFocus();
  });

  it('clears on Backspace or Delete from the focused trigger', () => {
    const { onClear } = renderControl(true);
    const trigger = screen.getByRole('button', { name: 'Warehouse' });

    fireEvent.keyDown(trigger, { key: 'Backspace' });
    fireEvent.keyDown(trigger, { key: 'Delete' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onClear).toHaveBeenCalledTimes(2);
  });

  it('ignores Backspace when nothing can be cleared', () => {
    const { onClear } = renderControl(false);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Warehouse' }), {
      key: 'Backspace',
    });
    expect(onClear).not.toHaveBeenCalled();
  });

  it('names the clear button in Arabic', async () => {
    await setTestLanguage('ar');
    renderControl(true);
    expect(
      screen.getByRole('button', { name: 'مسح الاختيار' }),
    ).toBeInTheDocument();
  });
});
