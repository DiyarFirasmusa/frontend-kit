import { describe, expect, it, vi } from 'vitest';
import { tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { Combobox } from './combobox';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

interface Props {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
}

function renderCombobox({ value = 'a', ...rest }: Props = {}) {
  const onChange = vi.fn();
  const utils = renderWithProviders(
    <Combobox
      id="warehouse"
      aria-label="Warehouse"
      value={value}
      onChange={onChange}
      options={OPTIONS}
      placeholder="Pick"
      {...rest}
    />,
  );
  return { ...utils, onChange };
}

const clearButton = () =>
  screen.queryByRole('button', { name: tt('common.clearValue') });

describe('Combobox clear button', () => {
  it('calls onChange with an empty value and keeps the popup closed', async () => {
    const { user, onChange } = renderCombobox();

    await user.click(clearButton() as HTMLElement);

    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears with Backspace on the focused trigger', async () => {
    const { user, onChange } = renderCombobox();
    const trigger = screen.getByRole('button', { name: 'Alpha' });

    trigger.focus();
    await user.keyboard('{Backspace}');

    expect(onChange).toHaveBeenCalledWith('');
  });

  it.each([
    ['required', { required: true }],
    ['empty', { value: '' }],
    ['disabled', { disabled: true }],
    ['opted out', { clearable: false }],
  ] as const)('is hidden when %s', (_label, props) => {
    renderCombobox(props);
    expect(clearButton()).not.toBeInTheDocument();
  });
});
