import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins truthy classes and drops falsy ones', () => {
    expect(cn('a', false, undefined, 'b', null)).toBe('a b');
  });

  it('lets the later Tailwind class win a conflict', () => {
    expect(cn('p-2 text-b1', 'p-4')).toBe('text-b1 p-4');
    expect(cn('bg-surface', 'bg-primary')).toBe('bg-primary');
  });

  it('keeps a type-ramp utility next to a text colour', () => {
    expect(cn('text-h1', 'text-text-primary')).toBe(
      'text-h1 text-text-primary',
    );
    expect(cn('text-text-primary', 'text-b2')).toBe(
      'text-text-primary text-b2',
    );
  });

  it('lets a later ramp utility or font size replace an earlier one', () => {
    expect(cn('text-h1', 'text-b2')).toBe('text-b2');
    expect(cn('text-b1', 'text-sm')).toBe('text-sm');
  });

  it('understands the role-based spacing and radius names', () => {
    expect(cn('p-card', 'p-4')).toBe('p-4');
    expect(cn('gap-field', 'gap-row')).toBe('gap-row');
    expect(cn('rounded-lg', 'rounded-pill')).toBe('rounded-pill');
  });
});
