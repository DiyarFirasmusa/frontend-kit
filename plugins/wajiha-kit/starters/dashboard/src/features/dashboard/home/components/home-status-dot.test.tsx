import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { HomeStatusDot } from './home-status-dot';

describe('HomeStatusDot', () => {
  it('colours the word and the dot with the tone', () => {
    const { container } = renderWithProviders(
      <HomeStatusDot tone="danger" label="Urgent" />,
    );
    expect(screen.getByText('Urgent')).toHaveClass('text-danger');
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      'bg-danger',
    );
  });

  it('keeps the word in the primary text colour when asked', () => {
    const { container } = renderWithProviders(
      <HomeStatusDot tone="success" label="مرحّل" tintLabel={false} />,
    );
    expect(screen.getByText('مرحّل')).toHaveClass('text-text-primary');
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      'bg-success',
    );
  });
});
