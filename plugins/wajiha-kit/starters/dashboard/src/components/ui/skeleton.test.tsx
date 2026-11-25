import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders a placeholder block for loading state', () => {
    const { container } = renderWithProviders(
      <Skeleton className="h-4 w-20" />,
    );
    const block = container.querySelector('[data-slot="skeleton"]');
    expect(block).toBeInTheDocument();
  });
});
