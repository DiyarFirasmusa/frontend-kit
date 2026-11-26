import { useEffect, useRef, useState } from 'react';
import { ListSearchField } from '@/components/table/list-search-field';

export const SEARCH_DEBOUNCE_MS = 400;

export interface SearchFieldProps {
  /** The committed value (the URL's `q`). */
  value: string;
  /** Called once typing pauses for 400 ms, and at once when cleared. */
  onCommit: (value: string) => void;
  placeholder: string;
  label?: string;
  className?: string;
}

/**
 * List search box: keeps what the user types locally and commits it after a
 * pause, so the URL (and the request) changes once per search, not per key.
 * A value changed from outside (back button, "clear filters") replaces the
 * text.
 */
export function SearchField({
  value,
  onCommit,
  placeholder,
  label,
  className,
}: SearchFieldProps) {
  const [text, setText] = useState(value);
  const [committed, setCommitted] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Adopt an outside change during render (React's "adjust state on prop change").
  if (value !== committed) {
    setCommitted(value);
    setText(value);
  }

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const change = (next: string) => {
    setText(next);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    const commit = () => {
      setCommitted(next.trim());
      onCommit(next.trim());
    };
    if (next.trim() === '') {
      commit();
      return;
    }
    timer.current = setTimeout(commit, SEARCH_DEBOUNCE_MS);
  };

  return (
    <ListSearchField
      value={text}
      onChange={change}
      placeholder={placeholder}
      label={label}
      className={className}
    />
  );
}
