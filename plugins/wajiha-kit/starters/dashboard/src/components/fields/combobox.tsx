import { Popover } from '@base-ui/react/popover';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClearableControl } from '@/components/ui/clearable-control';
import { Check, ChevronDown, Search } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { SelectOption } from './select-option';

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  'aria-describedby'?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Announces "required" through aria-describedby (a button cannot take aria-required). */
  required?: boolean;
  /** Shows a clear button while a value is picked. Defaults to `!required`. */
  clearable?: boolean;
  className?: string;
  searchable?: boolean;
  /** Accessible name for the options listbox (usually the field label). */
  'aria-label'?: string;
  selectedLabel?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Fires when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Fires on every typed change, alongside onQueryChange. Also fires with ''
   * when the query is cleared on pick, and on popup close in uncontrolled mode
   * (only when a non-empty query is cleared).
   */
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
  /** Options revealed per scroll step (client side) when the source has no pages of its own. */
  pageSize?: number;
  /** Server paging: more pages exist after the loaded options. */
  hasMore?: boolean;
  /** Server paging: fetch the next page; the list calls it near the bottom. */
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

const DEFAULT_PAGE_SIZE = 20;
const LOAD_MORE_THRESHOLD_PX = 80;

export function Combobox({
  value,
  onChange,
  options,
  id,
  'aria-describedby': ariaDescribedBy,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  invalid,
  required,
  clearable = !required,
  className,
  searchable,
  'aria-label': ariaLabel,
  selectedLabel,
  query: controlledQuery,
  onQueryChange,
  onSearchChange,
  onOpenChange,
  isLoading,
  pageSize = DEFAULT_PAGE_SIZE,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: ComboboxProps) {
  const { t } = useTranslation();
  const requiredId = useId();
  const describedBy =
    [ariaDescribedBy, required ? requiredId : null].filter(Boolean).join(' ') ||
    undefined;
  const [open, setOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState('');
  // Keeps the picked option's label visible when the current options no longer
  // include it (e.g. after a search narrows the list). Callers do not need
  // their own copy of this fallback.
  const [picked, setPicked] = useState<SelectOption | null>(null);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const listRef = useRef<HTMLDivElement>(null);
  const isControlled = onQueryChange !== undefined;
  const query = isControlled ? (controlledQuery ?? '') : internalQuery;

  const updateQuery = (next: string) => {
    setVisibleCount(pageSize);
    if (isControlled) {
      onQueryChange?.(next);
    } else {
      setInternalQuery(next);
    }
    onSearchChange?.(next);
  };

  const showSearch = searchable ?? (isControlled || options.length > 7);
  const selected =
    options.find((o) => o.value === value) ??
    (picked !== null && picked.value === value ? picked : undefined);
  const triggerLabel = selected?.label ?? (value ? selectedLabel : undefined);
  const filtered =
    !isControlled && showSearch && query
      ? options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        )
      : options;
  const serverPaged = onLoadMore !== undefined;
  const shown = serverPaged ? filtered : filtered.slice(0, visibleCount);
  const canLoadMore = serverPaged
    ? hasMore === true
    : filtered.length > visibleCount;

  const loadMore = () => {
    if (isLoadingMore) {
      return;
    }
    if (serverPaged) {
      onLoadMore();
    } else {
      setVisibleCount((count) => count + pageSize);
    }
  };

  useEffect(() => {
    const list = listRef.current;
    if (
      open &&
      canLoadMore &&
      !isLoadingMore &&
      list !== null &&
      list.scrollHeight > 0 &&
      list.scrollHeight <= list.clientHeight
    ) {
      if (serverPaged) {
        onLoadMore();
      } else {
        setVisibleCount((count) => count + pageSize);
      }
    }
  }, [
    open,
    canLoadMore,
    isLoadingMore,
    shown.length,
    serverPaged,
    onLoadMore,
    pageSize,
  ]);

  return (
    <Popover.Root
      modal={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setVisibleCount(pageSize);
        }
        onOpenChange?.(next);
        if (!next && !isControlled && internalQuery !== '') {
          updateQuery('');
        }
      }}
    >
      <ClearableControl
        canClear={clearable && !disabled && value !== ''}
        onClear={() => {
          setPicked(null);
          onChange('');
        }}
        className={className}
      >
        <Popover.Trigger
          id={id}
          aria-describedby={describedBy}
          type="button"
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            'control justify-between',
            'data-placeholder:text-text-muted',
            className,
          )}
        >
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-start',
              !triggerLabel && 'text-text-muted',
            )}
            title={triggerLabel}
          >
            {triggerLabel ?? placeholder ?? t('common.select')}
          </span>
          <ChevronDown
            aria-hidden
            className="control-chevron text-text-secondary pointer-events-none size-5 shrink-0"
          />
        </Popover.Trigger>
      </ClearableControl>
      {required ? (
        <span id={requiredId} hidden>
          {t('common.required')}
        </span>
      ) : null}

      <Popover.Portal>
        <Popover.Positioner
          positionMethod="fixed"
          sideOffset={4}
          align="start"
          className="z-50 w-(--anchor-width)"
        >
          <Popover.Popup className="select-popup data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-100 outline-none">
            {showSearch ? (
              <div className="select-search">
                <Search className="text-text-secondary size-5 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    updateQuery(e.target.value);
                  }}
                  placeholder={searchPlaceholder ?? t('common.search')}
                  aria-label={searchPlaceholder ?? t('common.search')}
                  className="select-search-input"
                />
              </div>
            ) : null}
            <div
              ref={listRef}
              className="select-popup-list"
              onScroll={(event) => {
                const list = event.currentTarget;
                if (
                  canLoadMore &&
                  list.scrollHeight - list.scrollTop - list.clientHeight <
                    LOAD_MORE_THRESHOLD_PX
                ) {
                  loadMore();
                }
              }}
            >
              {isLoading ? (
                <p role="status" className="select-empty">
                  {t('common.loading')}
                </p>
              ) : filtered.length === 0 ? (
                <p role="status" className="select-empty">
                  {emptyMessage ??
                    (isControlled && query.trim() === ''
                      ? t('common.typeToSearch')
                      : t('common.noResults'))}
                </p>
              ) : (
                <div role="listbox" aria-label={ariaLabel}>
                  {shown.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value || '__empty'}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={opt.disabled}
                        title={
                          opt.description
                            ? `${opt.label} · ${opt.description}`
                            : opt.label
                        }
                        onClick={() => {
                          setPicked(opt);
                          onChange(opt.value);
                          setOpen(false);
                          onOpenChange?.(false);
                          updateQuery('');
                        }}
                        className={cn(
                          'select-item',
                          isSelected && 'select-item-selected',
                        )}
                      >
                        <span className="select-item-label">
                          {opt.label}
                          {opt.description ? (
                            <span className="select-item-description">
                              {opt.description}
                            </span>
                          ) : null}
                        </span>
                        {isSelected ? (
                          <span className="select-item-check" aria-hidden>
                            <Check className="size-4" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
              {isLoadingMore ? (
                <p role="status" className="select-empty">
                  {t('common.loading')}
                </p>
              ) : null}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
