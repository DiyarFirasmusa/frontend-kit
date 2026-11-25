import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, userEvent } from '@/test/render';
import { SelectControl } from './select-control';

const OPTIONS = [
  { value: '', label: 'None' },
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('SelectControl', () => {
  it('opens and selects an option', async () => {
    const user = userEvent.setup();
    let value = '';
    const { rerender } = renderWithProviders(
      <SelectControl
        value={value}
        onChange={(next) => {
          value = next;
        }}
        options={OPTIONS}
        aria-label="Choice"
        placeholder="Pick"
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Choice' }));
    await user.click(await screen.findByRole('option', { name: 'Beta' }));
    expect(value).toBe('b');
    rerender(
      <SelectControl
        value={value}
        onChange={(next) => {
          value = next;
        }}
        options={OPTIONS}
        aria-label="Choice"
        placeholder="Pick"
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Choice' })).toHaveTextContent(
      'Beta',
    );
  });

  it('maps the empty option back to an empty string', async () => {
    const user = userEvent.setup();
    let value = 'a';
    renderWithProviders(
      <SelectControl
        value={value}
        onChange={(next) => {
          value = next;
        }}
        options={OPTIONS}
        aria-label="Choice"
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Choice' }));
    await user.click(await screen.findByRole('option', { name: 'None' }));
    expect(value).toBe('');
  });

  it('renders the trigger in Arabic', async () => {
    await setTestLanguage('ar');
    renderWithProviders(
      <SelectControl
        value=""
        onChange={() => {}}
        options={OPTIONS}
        aria-label={tt('common.select')}
      />,
    );
    expect(
      screen.getByRole('combobox', { name: tt('common.select') }),
    ).toBeInTheDocument();
    await setTestLanguage('en');
  });
});
