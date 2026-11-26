import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  hasWidthOverride,
} from './dropdown-menu';

function Menu({ onEdit }: { onEdit: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Row actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('opens a menu of items from the trigger', async () => {
    const { user } = renderWithProviders(<Menu onEdit={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Delete' }),
    ).toBeInTheDocument();
  });

  it('invokes the item handler and closes the menu on select', async () => {
    const onEdit = vi.fn();
    const { user } = renderWithProviders(<Menu onEdit={onEdit} />);
    await user.click(screen.getByRole('button', { name: 'Row actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('marks the keyboard-highlighted item for the start-edge focus bar', async () => {
    const { user } = renderWithProviders(<Menu onEdit={vi.fn()} />);
    screen.getByRole('button', { name: 'Row actions' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    await user.keyboard('{ArrowDown}');

    // The bar itself is CSS (style/select.css: .menu-item[data-highlighted]).
    await waitFor(() => {
      expect(
        document.querySelector('.menu-item[data-highlighted]'),
      ).not.toBeNull();
    });
    for (const item of screen.getAllByRole('menuitem')) {
      expect(item).toHaveClass('menu-item');
    }
  });

  it('forwards consumer props to the popup element', async () => {
    const { user } = renderWithProviders(
      <DropdownMenu>
        <DropdownMenuTrigger>Sized</DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Sized actions">
          <DropdownMenuItem>Only</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Sized' }));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAttribute('aria-label', 'Sized actions');
    expect(screen.getByRole('menuitem', { name: 'Only' })).toBeInTheDocument();
  });
});

describe('hasWidthOverride', () => {
  it('detects plain, min, max and variant-prefixed width classes', () => {
    expect(hasWidthOverride('w-64')).toBe(true);
    expect(hasWidthOverride('min-w-40 text-b2')).toBe(true);
    expect(hasWidthOverride('max-w-xs')).toBe(true);
    expect(hasWidthOverride('sm:w-72')).toBe(true);
    expect(hasWidthOverride('data-[side=bottom]:min-w-40')).toBe(true);
    expect(hasWidthOverride('!w-64')).toBe(true);
  });

  it('ignores unrelated classes', () => {
    expect(hasWidthOverride('flex-w-grow p-2')).toBe(false);
    expect(hasWidthOverride('shadow-mid')).toBe(false);
    expect(hasWidthOverride('')).toBe(false);
  });
});
