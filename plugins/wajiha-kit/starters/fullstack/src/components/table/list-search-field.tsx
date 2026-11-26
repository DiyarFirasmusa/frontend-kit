import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from '@/components/ui/icons';
import { cn } from '@/shared/utils/cn';

/** The list search shortcut. ⌘K belongs to the top bar's global search. */
const LIST_SEARCH_SHORTCUT = '/';

export interface ListSearchFieldProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  /** Accessible name; defaults to the shared "Search" label. */
  label?: string;
  /** Shows a fixed context (e.g. the selected item) instead of a search box. */
  readOnly?: boolean;
  className?: string;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

/** Toolbar search: icon at the start, "/" shortcut chip at the end. */
export function ListSearchField({
  value,
  onChange,
  placeholder,
  label,
  readOnly = false,
  className,
}: ListSearchFieldProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (readOnly) {
      return;
    }
    function handleShortcut(event: KeyboardEvent) {
      if (
        event.key !== LIST_SEARCH_SHORTCUT ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener('keydown', handleShortcut);
    return () => {
      document.removeEventListener('keydown', handleShortcut);
    };
  }, [readOnly]);

  return (
    <div className={cn('relative min-w-48 flex-1 basis-56', className)}>
      <Search
        aria-hidden
        className="text-text-muted pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
      />
      <input
        ref={inputRef}
        type={readOnly ? 'text' : 'search'}
        value={value}
        readOnly={readOnly}
        onChange={(event) => {
          onChange?.(event.target.value);
        }}
        placeholder={placeholder}
        aria-label={label ?? t('ui.search')}
        className={cn('control select-trigger-compact ps-10', !readOnly && 'md:pe-12')}
      />
      {readOnly ? null : (
        <kbd
          aria-hidden
          data-slot="kbd"
          className="bg-kbd text-text-secondary text-b3 pointer-events-none absolute end-2 top-1/2 hidden h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-(--radius-kbd) px-1.5 md:inline-flex"
        >
          {LIST_SEARCH_SHORTCUT}
        </kbd>
      )}
    </div>
  );
}
