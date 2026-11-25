import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArrowUpLeft, Hand, History, Sparkles } from './icons';

describe('icon registry', () => {
  it.each([
    ['ArrowUpLeft', ArrowUpLeft],
    ['Hand', Hand],
    ['History', History],
    ['Sparkles', Sparkles],
  ])('%s renders a 1.5 stroke svg sized by its class', (name, Icon) => {
    const { container } = render(<Icon className="size-4" aria-hidden />);
    const svg = container.querySelector('svg');

    expect((Icon as { displayName?: string }).displayName).toBe(name);
    expect(svg).not.toBeNull();
    expect(svg).toHaveClass('size-4');
    expect(svg?.querySelector('[stroke-width="1.5"]')).not.toBeNull();
  });
});
