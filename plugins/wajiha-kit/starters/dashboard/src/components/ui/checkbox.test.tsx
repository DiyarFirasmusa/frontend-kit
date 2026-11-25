import { describe, expect, it } from 'vitest';
import { contrast } from '@/style/tokens/contrast';
import { PRESETS } from '@/style/tokens/presets';
import { renderWithProviders, screen } from '@/test/render';
import { Checkbox } from './checkbox';

function channel(hex: string, i: number): number {
  return parseInt(hex.slice(i, i + 2), 16);
}

function mix(a: string, b: string, weight: number): string {
  return `#${[1, 3, 5]
    .map((i) =>
      Math.round(channel(a, i) * weight + channel(b, i) * (1 - weight))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

describe('Checkbox', () => {
  it('renders an unchecked checkbox with the data-slot hook', () => {
    renderWithProviders(<Checkbox aria-label="Select row" />);
    const box = screen.getByRole('checkbox', { name: 'Select row' });
    expect(box).toHaveAttribute('aria-checked', 'false');
    expect(box).toHaveAttribute('data-slot', 'checkbox');
  });

  it('toggles to checked on click', async () => {
    const { user } = renderWithProviders(<Checkbox aria-label="Select row" />);
    const box = screen.getByRole('checkbox', { name: 'Select row' });
    await user.click(box);
    expect(box).toHaveAttribute('aria-checked', 'true');
    expect(box).toHaveAttribute('data-checked');
  });

  const modes = PRESETS.flatMap((preset) =>
    (['light', 'dark'] as const).map((mode) => ({
      label: `${preset.id} ${mode}`,
      tokens: preset[mode],
    })),
  );

  it.each(modes)(
    'keeps the unchecked border at 3:1 against the control fill in $label',
    ({ tokens }) => {
      const text = tokens['text-primary'];
      const surface = tokens.surface;
      const controlFill = mix(text, surface, 0.04);
      const border = mix(text, controlFill, 0.5);
      expect(contrast(border, controlFill)).toBeGreaterThanOrEqual(3);
      expect(contrast(border, surface)).toBeGreaterThanOrEqual(3);
    },
  );
});
