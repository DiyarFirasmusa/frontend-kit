import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { Input } from './input';
import { Label, RequiredMark } from './label';

describe('Label', () => {
  it('associates its text with a control through htmlFor', () => {
    renderWithProviders(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>,
    );
    expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox'));
  });

  it('applies the label typography class', () => {
    renderWithProviders(<Label htmlFor="x">Name</Label>);
    expect(screen.getByText('Name')).toHaveClass('text-label');
  });
});

describe('RequiredMark', () => {
  it('shows a danger-coloured star hidden from assistive tech', () => {
    renderWithProviders(
      <>
        <Label htmlFor="code">
          Code
          <RequiredMark />
        </Label>
        <Input id="code" aria-required />
      </>,
    );
    const mark = screen.getByText('*');
    expect(mark).toHaveAttribute('aria-hidden', 'true');
    expect(mark).toHaveClass('text-danger');
    expect(screen.getByRole('textbox', { name: 'Code' })).toHaveAttribute('aria-required', 'true');
  });
});

describe('Input', () => {
  it('renders the shared .control class and accepts typing', async () => {
    const { user } = renderWithProviders(<Input aria-label="Search" />);
    const input = screen.getByRole('textbox', { name: 'Search' });
    expect(input).toHaveClass('control');
    await user.type(input, 'abc');
    expect(input).toHaveValue('abc');
  });
});
