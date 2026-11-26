import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_DEBOUNCE_MS, SearchField } from './search-field';

describe('SearchField', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('commits once after typing pauses', () => {
    const onCommit = vi.fn();
    render(<SearchField value="" onCommit={onCommit} placeholder="Search" />);
    const box = screen.getByRole('searchbox');
    fireEvent.change(box, { target: { value: 'a' } });
    fireEvent.change(box, { target: { value: 'ab' } });
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    });
    expect(onCommit).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onCommit).toHaveBeenCalledExactlyOnceWith('ab');
  });

  it('commits a cleared box at once', () => {
    const onCommit = vi.fn();
    render(<SearchField value="ab" onCommit={onCommit} placeholder="Search" />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
    expect(onCommit).toHaveBeenCalledExactlyOnceWith('');
  });

  it('shows a value changed from outside (back button, clear filters)', () => {
    const { rerender } = render(
      <SearchField value="old" onCommit={vi.fn()} placeholder="Search" />,
    );
    rerender(<SearchField value="" onCommit={vi.fn()} placeholder="Search" />);
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });
});
