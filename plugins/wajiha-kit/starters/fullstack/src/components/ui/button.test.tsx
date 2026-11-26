import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { Button } from './button';

describe('Button', () => {
  it('renders btn-lg for size="lg"', () => {
    renderWithProviders(<Button size="lg">Continue</Button>);
    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button).toHaveClass('btn', 'btn-lg');
  });

  it('renders btn-sm for size="sm"', () => {
    renderWithProviders(<Button size="sm">Continue</Button>);
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass('btn', 'btn-sm');
  });

  it('renders btn-xs for size="xs"', () => {
    renderWithProviders(<Button size="xs">Continue</Button>);
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass('btn', 'btn-xs');
  });

  it('renders only the base btn class for the default size (38px)', () => {
    renderWithProviders(<Button>Continue</Button>);
    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button).toHaveClass('btn');
    expect(button.className).not.toMatch(/\bbtn-(lg|sm|xs|pill)\b/);
  });

  it('renders btn-pill for size="pill" (top-bar CTA)', () => {
    renderWithProviders(<Button size="pill">Create</Button>);
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass('btn', 'btn-pill');
  });

  it('renders square icon classes for every icon size', () => {
    renderWithProviders(
      <>
        <Button size="icon" aria-label="icon-md" />
        <Button size="icon-xs" aria-label="icon-xs" />
        <Button size="icon-sm" aria-label="icon-sm" />
        <Button size="icon-lg" aria-label="icon-lg" />
      </>,
    );
    expect(screen.getByRole('button', { name: 'icon-md' })).toHaveClass('btn-icon');
    expect(screen.getByRole('button', { name: 'icon-xs' })).toHaveClass('btn-icon', 'btn-xs');
    expect(screen.getByRole('button', { name: 'icon-sm' })).toHaveClass('btn-icon', 'btn-sm');
    expect(screen.getByRole('button', { name: 'icon-lg' })).toHaveClass('btn-icon', 'btn-lg');
  });

  it('renders btn-soft-danger for variant="destructive"', () => {
    renderWithProviders(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('btn-soft-danger');
  });

  it('is disabled and does not fire clicks when disabled', async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has no built-in spinner (loading UI lives in the containers and dialogs)', () => {
    const { container } = renderWithProviders(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders the child element instead of a button when asChild is set', () => {
    renderWithProviders(
      <Button asChild>
        <a href="/somewhere">Go</a>
      </Button>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveClass('btn');
    expect(link).toHaveAttribute('href', '/somewhere');
  });
});
