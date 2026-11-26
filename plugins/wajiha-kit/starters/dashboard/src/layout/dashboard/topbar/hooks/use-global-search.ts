import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { qk } from '@/constants/query-keys';
import { fetchGlobalSearch } from '../services/search.service';
import type {
  GlobalSearchOption,
  GlobalSearchSection,
  GlobalSearchStatus,
} from '../types/types';
import {
  buildSearchOptions,
  groupSearchOptions,
} from '../utils/search-options';

export const SEARCH_DEBOUNCE_MS = 400;
export const SEARCH_MIN_LENGTH = 2;

function isApplePlatform(): boolean {
  return /mac|iphone|ipad|ipod/i.test(globalThis.navigator?.platform ?? '');
}

export interface GlobalSearchState {
  inputRef: RefObject<HTMLInputElement | null>;
  listboxId: string;
  optionId: (index: number) => string;
  value: string;
  isPopupVisible: boolean;
  status: GlobalSearchStatus;
  options: GlobalSearchOption[];
  sections: GlobalSearchSection[];
  activeIndex: number;
  shortcutLabel: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSelect: (option: GlobalSearchOption) => void;
  onHover: (index: number) => void;
}

interface UseGlobalSearchOptions {
  /** A ref the caller keeps, so Ctrl/Cmd+K can focus this field. */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Runs after a result is chosen, e.g. to close the search dialog. */
  onSelected?: () => void;
}

export function useGlobalSearch({
  inputRef: outerRef,
  onSelected,
}: UseGlobalSearchOptions = {}): GlobalSearchState {
  const navigate = useNavigate();
  const ownRef = useRef<HTMLInputElement>(null);
  const inputRef = outerRef ?? ownRef;
  const listboxId = useId();
  const [value, setValue] = useState('');
  const [debounced, setDebounced] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = value.trim();
  const debouncedTrimmed = debounced.trim();
  const isSearchable = debouncedTrimmed.length >= SEARCH_MIN_LENGTH;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [value]);

  const query = useQuery({
    queryKey: qk.search.query(debouncedTrimmed),
    queryFn: ({ signal }) => fetchGlobalSearch(debouncedTrimmed, signal),
    enabled: isSearchable,
    retry: false,
  });

  const options = useMemo(
    () =>
      isSearchable && trimmed === debouncedTrimmed
        ? buildSearchOptions(query.data)
        : [],
    [isSearchable, trimmed, debouncedTrimmed, query.data],
  );
  const sections = useMemo(() => groupSearchOptions(options), [options]);

  let status: GlobalSearchStatus = 'results';
  if (trimmed !== debouncedTrimmed || (isSearchable && query.isFetching)) {
    status = 'loading';
  } else if (query.isError) {
    status = 'error';
  } else if (options.length === 0) {
    status = 'empty';
  }

  const isPopupVisible = isOpen && trimmed.length >= SEARCH_MIN_LENGTH;
  const safeActiveIndex =
    status === 'results' && activeIndex < options.length ? activeIndex : -1;

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const onSelect = useCallback(
    (option: GlobalSearchOption) => {
      close();
      setValue('');
      setDebounced('');
      inputRef.current?.blur();
      onSelected?.();
      switch (option.group) {
        case 'warehouses':
          void navigate({
            to: '/warehouses/$warehouseId',
            params: { warehouseId: option.id },
          });
          break;
        case 'suppliers':
          void navigate({ to: '/suppliers' });
          break;
        case 'categories':
          void navigate({ to: '/categories' });
          break;
        case 'units':
          void navigate({ to: '/units-of-measure' });
          break;
      }
    },
    [close, navigate, inputRef, onSelected],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const count = status === 'results' ? options.length : 0;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      if (count === 0) {
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const start = safeActiveIndex === -1 && step === -1 ? 0 : safeActiveIndex;
      setActiveIndex((start + step + count) % count);
      return;
    }
    if (event.key === 'Enter') {
      const option = options[safeActiveIndex];
      if (isPopupVisible && option) {
        event.preventDefault();
        onSelect(option);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (isPopupVisible) {
        close();
      } else {
        setValue('');
        setDebounced('');
      }
    }
  };

  return {
    inputRef,
    listboxId,
    optionId: (index) => `${listboxId}-option-${index}`,
    value,
    isPopupVisible,
    status,
    options,
    sections,
    activeIndex: safeActiveIndex,
    shortcutLabel: isApplePlatform() ? '⌘K' : 'Ctrl K',
    onChange: (event) => {
      setValue(event.target.value);
      setIsOpen(true);
      setActiveIndex(-1);
    },
    onFocus: () => {
      setIsOpen(true);
    },
    onBlur: close,
    onKeyDown,
    onSelect,
    onHover: setActiveIndex,
  };
}
