import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { Switch } from './switch';

describe('Switch', () => {
  it('exposes aria-checked and data-checked for the on state', () => {
    renderWithProviders(<Switch aria-label="Notifications" defaultChecked />);
    const control = screen.getByRole('switch', { name: 'Notifications' });
    expect(control).toHaveAttribute('aria-checked', 'true');
    expect(control).toHaveAttribute('data-checked');
  });

  it('exposes aria-checked=false and data-unchecked for the off state', () => {
    renderWithProviders(<Switch aria-label="Notifications" />);
    const control = screen.getByRole('switch', { name: 'Notifications' });
    expect(control).toHaveAttribute('aria-checked', 'false');
    expect(control).toHaveAttribute('data-unchecked');
  });

  it('toggles on click and reports the new value', async () => {
    const onCheckedChange = vi.fn();
    const { user } = renderWithProviders(
      <Switch aria-label="Notifications" onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(screen.getByRole('switch', { name: 'Notifications' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('keeps an LTR track so "on" sits at the right in Arabic too', () => {
    renderWithProviders(<Switch aria-label="Active" defaultChecked />);
    expect(screen.getByRole('switch', { name: 'Active' })).toHaveAttribute('dir', 'ltr');
  });
});
