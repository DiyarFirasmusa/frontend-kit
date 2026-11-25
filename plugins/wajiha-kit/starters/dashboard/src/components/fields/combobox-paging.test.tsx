import { describe, expect, it, vi } from 'vitest';
import { tt } from '@/test/i18n';
import {
  fireEvent,
  renderWithProviders,
  screen,
  userEvent,
} from '@/test/render';
import { Combobox } from './combobox';

function manyOptions(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    value: `v-${index}`,
    label: `Option ${index}`,
  }));
}

async function openList(label: RegExp) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: label }));
  return screen.findByRole('listbox');
}

function scrollToBottom(list: HTMLElement) {
  Object.defineProperty(list, 'scrollHeight', {
    configurable: true,
    value: 1000,
  });
  Object.defineProperty(list, 'clientHeight', {
    configurable: true,
    value: 300,
  });
  Object.defineProperty(list, 'scrollTop', {
    configurable: true,
    value: 700,
  });
  fireEvent.scroll(list);
}

describe('Combobox paging', () => {
  it('shows 20 options first and reveals 20 more each time the list is scrolled to the end', async () => {
    renderWithProviders(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={manyOptions(50)}
        placeholder="Pick"
      />,
    );
    const listbox = await openList(/Pick/);
    expect(screen.getAllByRole('option')).toHaveLength(20);

    const scroller = listbox.parentElement as HTMLElement;
    scrollToBottom(scroller);
    expect(screen.getAllByRole('option')).toHaveLength(40);

    scrollToBottom(scroller);
    expect(screen.getAllByRole('option')).toHaveLength(50);
  });

  it('does not reveal more when scrolled away from the end', async () => {
    renderWithProviders(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={manyOptions(50)}
        placeholder="Pick"
      />,
    );
    const listbox = await openList(/Pick/);
    const scroller = listbox.parentElement as HTMLElement;
    Object.defineProperty(scroller, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(scroller, 'clientHeight', {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(scroller, 'scrollTop', {
      configurable: true,
      value: 100,
    });
    fireEvent.scroll(scroller);

    expect(screen.getAllByRole('option')).toHaveLength(20);
  });

  it('asks the source for the next page near the end instead of slicing, and shows a loading row', async () => {
    const onLoadMore = vi.fn();
    renderWithProviders(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={manyOptions(25)}
        placeholder="Pick"
        hasMore
        onLoadMore={onLoadMore}
        isLoadingMore
      />,
    );
    const listbox = await openList(/Pick/);
    expect(screen.getAllByRole('option')).toHaveLength(25);
    expect(screen.getByText(tt('common.loading'))).toBeInTheDocument();

    scrollToBottom(listbox.parentElement as HTMLElement);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('calls onLoadMore when the list reaches the end and more pages exist', async () => {
    const onLoadMore = vi.fn();
    renderWithProviders(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={manyOptions(25)}
        placeholder="Pick"
        hasMore
        onLoadMore={onLoadMore}
      />,
    );
    const listbox = await openList(/Pick/);
    scrollToBottom(listbox.parentElement as HTMLElement);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('never calls onLoadMore once the last page has loaded', async () => {
    const onLoadMore = vi.fn();
    renderWithProviders(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={manyOptions(25)}
        placeholder="Pick"
        hasMore={false}
        onLoadMore={onLoadMore}
      />,
    );
    const listbox = await openList(/Pick/);
    scrollToBottom(listbox.parentElement as HTMLElement);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('says "type to search" instead of "no results" before anything is typed in a searched list', async () => {
    renderWithProviders(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={[]}
        placeholder="Pick"
        query=""
        onQueryChange={vi.fn()}
        searchable
      />,
    );
    await openList(/Pick/).catch(() => null);

    expect(screen.getByText(tt('common.typeToSearch'))).toBeInTheDocument();
    expect(screen.queryByText(tt('common.noResults'))).not.toBeInTheDocument();
  });

  it('reports the popup closing when an option is picked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={manyOptions(3)}
        placeholder="Pick"
        onOpenChange={onOpenChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Pick/ }));
    await user.click(await screen.findByRole('option', { name: 'Option 1' }));

    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
