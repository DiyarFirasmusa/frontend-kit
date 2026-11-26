import { describe, expect, it, vi } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { ListFilterSelect } from './list-filter-select';

const OPTIONS = [
  { value: 'oldest', label: 'Oldest first' },
  { value: 'newest', label: 'Newest first' },
];

describe('ListFilterSelect', () => {
  it('reads the filter name until a value is picked, then reports it', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <ListFilterSelect label="Order" value="" options={OPTIONS} onChange={onChange} />,
    );

    const trigger = screen.getByRole('combobox', { name: 'Order' });
    expect(trigger).toHaveTextContent('Order');
    expect(trigger).not.toHaveTextContent(tt('ui.all'));
    await user.click(trigger);
    expect(await screen.findByRole('option', { name: tt('ui.all') })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Newest first' }));

    expect(onChange).toHaveBeenCalledWith('newest');
  });

  it('clears the filter from the "All" option', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <ListFilterSelect label="Order" value="newest" options={OPTIONS} onChange={onChange} />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Order' }));
    await user.click(await screen.findByRole('option', { name: tt('ui.all') }));

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('clears a picked filter from the clear button without opening it', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <ListFilterSelect label="Order" value="newest" options={OPTIONS} onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', { name: tt('ui.clearValue') }));

    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('offers no clear button on an empty or required filter', () => {
    const { rerender } = renderWithProviders(
      <ListFilterSelect label="Order" value="" options={OPTIONS} onChange={vi.fn()} />,
    );
    expect(screen.queryByRole('button', { name: tt('ui.clearValue') })).not.toBeInTheDocument();

    rerender(
      <ListFilterSelect
        label="Order"
        value="oldest"
        options={OPTIONS}
        allowAll={false}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: tt('ui.clearValue') })).not.toBeInTheDocument();
  });

  it('prefixes a required choice with the filter name and offers no "All"', async () => {
    const { user } = renderWithProviders(
      <ListFilterSelect
        label="Order"
        value="oldest"
        options={OPTIONS}
        allowAll={false}
        onChange={vi.fn()}
      />,
    );

    const trigger = screen.getByRole('combobox', { name: 'Order' });
    expect(trigger).toHaveTextContent('Order: Oldest first');
    await user.click(trigger);
    await screen.findByRole('option', { name: 'Newest first' });
    expect(screen.queryByRole('option', { name: tt('ui.all') })).not.toBeInTheDocument();
  });

  it('offers the Arabic "All" option', async () => {
    await setTestLanguage('ar');
    const { user } = renderWithProviders(
      <ListFilterSelect label="المستودع" value="" options={OPTIONS} onChange={vi.fn()} />,
    );

    await user.click(screen.getByRole('combobox', { name: 'المستودع' }));

    expect(await screen.findByRole('option', { name: 'الكل' })).toBeInTheDocument();
  });
});
