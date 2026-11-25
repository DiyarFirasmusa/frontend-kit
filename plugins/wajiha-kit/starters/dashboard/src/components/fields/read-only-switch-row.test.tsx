import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { ReadOnlySwitchRow } from './read-only-switch-row';

describe('ReadOnlySwitchRow', () => {
  it('shows a checked switch named by its label', () => {
    renderWithProviders(<ReadOnlySwitchRow label="Active" checked />);

    expect(screen.getByRole('switch', { name: 'Active' })).toBeChecked();
  });

  it('cannot be toggled and labels itself in Arabic', async () => {
    const { user } = renderWithProviders(
      <ReadOnlySwitchRow label="مستودع عبور" checked={false} />,
    );
    const toggle = screen.getByRole('switch', { name: 'مستودع عبور' });

    await user.click(toggle);

    expect(toggle).not.toBeChecked();
  });
});
