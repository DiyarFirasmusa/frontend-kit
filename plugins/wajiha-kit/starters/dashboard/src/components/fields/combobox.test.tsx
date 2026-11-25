import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChevronDown } from '@/lib/icons';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, userEvent, waitFor } from '@/test/render';
import { Combobox } from './combobox';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
  { value: 'd', label: 'Delta' },
  { value: 'e', label: 'Epsilon' },
  { value: 'f', label: 'Zeta' },
  { value: 'g', label: 'Eta' },
  { value: 'h', label: 'Theta' },
  { value: 'i', label: 'Iota' },
];

describe('Combobox', () => {
  it('uses the same single down chevron as Select', () => {
    renderWithProviders(
      <Combobox value="" onChange={vi.fn()} options={OPTIONS} />,
    );
    const reference = render(<ChevronDown />).container.querySelector('svg');

    const chevron = screen.getByRole('button').querySelector('svg');
    expect(chevron?.innerHTML).toBe(reference?.innerHTML);
  });

  it('opens, filters by typing, and selects an option', async () => {
    const user = userEvent.setup();
    let value = '';
    const { rerender } = renderWithProviders(
      <Combobox
        value={value}
        onChange={(next) => {
          value = next;
        }}
        options={OPTIONS}
        placeholder="Pick"
      />,
    );

    await user.click(screen.getByRole('button', { name: /Pick/i }));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(tt('common.search')), 'Bet');
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Alpha' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Beta' }));
    expect(value).toBe('b');
    rerender(
      <Combobox
        value={value}
        onChange={(next) => {
          value = next;
        }}
        options={OPTIONS}
        placeholder="Pick"
      />,
    );
    expect(screen.getByRole('button', { name: /Beta/i })).toBeInTheDocument();
  });

  it('shows the empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Combobox value="" onChange={() => {}} options={OPTIONS} />,
    );
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByPlaceholderText(tt('common.search')), 'zzz');
    expect(screen.getByText(tt('common.noResults'))).toBeInTheDocument();
  });

  it('renders in Arabic', async () => {
    await setTestLanguage('ar');
    const user = userEvent.setup();
    renderWithProviders(
      <Combobox value="" onChange={() => {}} options={OPTIONS} />,
    );
    await user.click(screen.getByRole('button'));
    expect(
      screen.getByPlaceholderText(tt('common.search')),
    ).toBeInTheDocument();
    await setTestLanguage('en');
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Combobox value="" onChange={() => {}} options={OPTIONS} disabled />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    await user.click(screen.getByRole('button'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('keeps the selected label when the search results no longer include it', async () => {
    const user = userEvent.setup();
    let value = '';
    const { rerender } = renderWithProviders(
      <Combobox
        value={value}
        onChange={(next) => {
          value = next;
        }}
        options={OPTIONS}
        placeholder="Pick"
      />,
    );
    await user.click(screen.getByRole('button', { name: /Pick/i }));
    await user.click(await screen.findByRole('option', { name: 'Beta' }));
    rerender(
      <Combobox
        value={value}
        onChange={(next) => {
          value = next;
        }}
        options={OPTIONS.filter((o) => o.value !== 'b')}
        placeholder="Pick"
      />,
    );
    expect(screen.getByRole('button', { name: /Beta/i })).toBeInTheDocument();
  });

  it('notifies onSearchChange when the query is cleared on select', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    renderWithProviders(
      <Combobox
        value=""
        onChange={() => {}}
        options={OPTIONS}
        query=""
        onQueryChange={() => {}}
        onSearchChange={onSearchChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Select/i }));
    await user.type(screen.getByPlaceholderText(tt('common.search')), 'Bet');
    await user.click(await screen.findByRole('option', { name: 'Beta' }));
    expect(onSearchChange).toHaveBeenLastCalledWith('');
    expect(onSearchChange).toHaveBeenCalledWith('B');
  });

  it('does not clear a controlled query when the popup closes', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    const onSearchChange = vi.fn();
    renderWithProviders(
      <Combobox
        value=""
        onChange={() => {}}
        options={OPTIONS}
        query="Bet"
        onQueryChange={onQueryChange}
        onSearchChange={onSearchChange}
      />,
    );
    await user.click(screen.getByRole('button'));
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(onQueryChange).not.toHaveBeenCalledWith('');
    expect(onSearchChange).not.toHaveBeenCalledWith('');
  });

  it('does not notify onSearchChange when closed without a query', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    renderWithProviders(
      <Combobox
        value=""
        onChange={() => {}}
        options={OPTIONS}
        onSearchChange={onSearchChange}
      />,
    );
    await user.click(screen.getByRole('button'));
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('exposes the listbox under its accessible label', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Combobox
        value=""
        onChange={() => {}}
        options={OPTIONS}
        aria-label="Warehouse"
      />,
    );
    await user.click(screen.getByRole('button'));
    expect(
      await screen.findByRole('listbox', { name: 'Warehouse' }),
    ).toBeInTheDocument();
  });
});
