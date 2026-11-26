import { describe, expect, it, vi } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { ListSearchField } from './list-search-field';

describe('ListSearchField', () => {
  it('shows the slash chip and focuses on slash outside an input', async () => {
    const { user, container } = renderWithProviders(
      <ListSearchField value="" onChange={vi.fn()} placeholder="Search" />,
    );

    expect(container.querySelector('[data-slot="kbd"]')).toHaveTextContent('/');
    await user.keyboard('/');

    expect(screen.getByRole('searchbox')).toHaveFocus();
  });

  it('leaves ⌘K to the top bar', async () => {
    const { user } = renderWithProviders(
      <ListSearchField value="" onChange={vi.fn()} placeholder="Search" />,
    );

    await user.keyboard('{Control>}k{/Control}');

    expect(screen.getByRole('searchbox')).not.toHaveFocus();
  });

  it('reports typing', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <ListSearchField value="" onChange={onChange} placeholder="Search" />,
    );

    await user.type(screen.getByRole('searchbox'), 'a');

    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('renders a read-only context without the shortcut chip', () => {
    const { container } = renderWithProviders(
      <ListSearchField value="Gloves" placeholder="Item" label="Item" readOnly />,
    );

    expect(screen.getByRole('textbox', { name: 'Item' })).toHaveAttribute('readonly');
    expect(container.querySelector('[data-slot="kbd"]')).toBeNull();
  });

  it('uses the shared search label in English and Arabic', async () => {
    const { unmount } = renderWithProviders(
      <ListSearchField value="" onChange={vi.fn()} placeholder="…" />,
    );
    expect(screen.getByRole('searchbox', { name: tt('ui.search') })).toBeInTheDocument();
    unmount();

    await setTestLanguage('ar');
    renderWithProviders(<ListSearchField value="" onChange={vi.fn()} placeholder="…" />);
    expect(screen.getByRole('searchbox', { name: 'بحث' })).toBeInTheDocument();
  });
});
