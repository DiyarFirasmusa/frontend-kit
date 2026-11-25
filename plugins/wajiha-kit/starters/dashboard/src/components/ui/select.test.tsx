import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

function Harness() {
  return (
    <Select defaultValue="iqd">
      <SelectTrigger aria-label="Currency">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="iqd">IQD</SelectItem>
        <SelectItem value="usd">USD</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('SelectTrigger', () => {
  it('renders the trigger with the shared .control class and the combobox role', () => {
    renderWithProviders(<Harness />);
    const trigger = screen.getByRole('combobox', { name: 'Currency' });
    expect(trigger).toHaveClass('control');
  });

  it('is not a native select element', () => {
    const { container } = renderWithProviders(<Harness />);
    expect(container.querySelector('select')).toBeNull();
  });
});
