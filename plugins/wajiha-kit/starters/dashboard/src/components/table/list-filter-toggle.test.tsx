import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { ListFilterToggle } from './list-filter-toggle';

describe('ListFilterToggle', () => {
  it('is a labelled checkbox inside a bordered tile', () => {
    const { container } = renderWithProviders(
      <ListFilterToggle
        label="Show zero"
        checked={false}
        onCheckedChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('checkbox', { name: 'Show zero' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(container.querySelector('label')).toHaveClass('control');
  });

  it('reports the new state from the label or the box', async () => {
    const onCheckedChange = vi.fn();
    const { user } = renderWithProviders(
      <ListFilterToggle
        label="Show zero"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByText('Show zero'));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('shows an optional count', () => {
    renderWithProviders(
      <ListFilterToggle
        label="Awaiting me"
        checked
        count={3}
        onCheckedChange={vi.fn()}
      />,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
