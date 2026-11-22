# Filter bar code (example entity: users)

## validations/search.ts (filter part)

```ts
import { z } from 'zod';
import { looseText } from '@/lib/list-search';
import { USER_STATUSES } from '../types/types';

export const userSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().pipe(z.literal([10, 20, 50])).catch(20).default(20),
  sort: z.string().catch('').default(''),
  q: looseText.catch('').default(''), // the router hands ?q=100553 over as a number
  status: z.enum(['all', ...USER_STATUSES]).catch('all').default('all'),
  roleId: z.string().catch('').default(''),
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
});
export type UserSearch = z.infer<typeof userSearchSchema>;
export const defaultUserSearch: UserSearch = userSearchSchema.parse({});

export const USER_FILTER_KEYS = ['q', 'status', 'roleId', 'from', 'to'] as const;
export type UserFilters = Pick<UserSearch, (typeof USER_FILTER_KEYS)[number]>;
```

`list-params.ts` drops an inverted range (`from > to`) instead of sending it.

## hooks/filter/use-users-filters.ts

```ts
import { getRouteApi } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { USER_FILTER_KEYS, defaultUserSearch, type UserFilters } from '../../validations/search';

const routeApi = getRouteApi('/_app/users/');

export function countActiveFilters(values: UserFilters): number {
  return USER_FILTER_KEYS.filter((key) => values[key] !== defaultUserSearch[key]).length;
}

export function useUsersFilters() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const values: UserFilters = useMemo(
    () => ({ q: search.q, status: search.status, roleId: search.roleId, from: search.from, to: search.to }),
    [search.q, search.status, search.roleId, search.from, search.to],
  );

  const setFilters = useCallback(
    (patch: Partial<UserFilters>, options: { replace?: boolean } = {}) => {
      void navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }), replace: options.replace ?? false });
    },
    [navigate],
  );

  const clear = useCallback(() => {
    void navigate({
      search: (prev) => ({
        ...prev,
        q: defaultUserSearch.q,
        status: defaultUserSearch.status,
        roleId: defaultUserSearch.roleId,
        from: undefined,
        to: undefined,
        page: 1,
      }),
    });
  }, [navigate]);

  return { values, setFilters, clear, activeCount: countActiveFilters(values) };
}
```

## src/hooks/use-debounced-callback.ts (shared)

```ts
import { useEffect, useMemo, useRef } from 'react';

export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number,
): { run: (...args: TArgs) => void; cancel: () => void } {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useMemo(
    () => ({
      run: (...args: TArgs) => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          callbackRef.current(...args);
        }, delayMs);
      },
      cancel: () => {
        clearTimeout(timerRef.current);
      },
    }),
    [delayMs],
  );
}
```

## src/components/filters/search-field.tsx (shared)

```tsx
import { useState } from 'react';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

interface SearchFieldProps {
  value: string;
  onDebouncedChange: (next: string) => void;
  label: string;
  clearLabel: string;
  placeholder?: string;
  delayMs?: number;
}

export function SearchField({ value, onDebouncedChange, label, clearLabel, placeholder, delayMs = 400 }: SearchFieldProps) {
  const [text, setText] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const debounced = useDebouncedCallback(onDebouncedChange, delayMs);

  // The URL changed from outside (clear filters, back button): show it.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(value);
  }

  return (
    <div className="relative min-w-0 flex-1">
      <SearchIcon className="text-muted pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          debounced.run(event.target.value.trim());
        }}
        className="min-h-11 w-full rounded-lg border ps-9 pe-10"
      />
      {text ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => {
            debounced.cancel();
            setText('');
            onDebouncedChange('');
          }}
          className="absolute inset-e-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center"
        >
          <CloseIcon className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
```

`SearchIcon` / `CloseIcon` come from the project's icon registry. `inset-s-*` / `inset-e-*` need Tailwind 4.2: on older
versions write `start-3` and `end-1`, or both lose their position.

## src/components/filters/filter-bar.tsx (shared layout)

```tsx
import { useId, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface FilterBarProps {
  label: string;
  search: ReactNode;
  activeCount: number;
  onClear: () => void;
  children: ReactNode; // the other filter controls
}

export function FilterBar({ label, search, activeCount, onClear, children }: FilterBarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <search aria-label={label} className="space-y-3">
      <div className="flex items-center gap-2">
        {search}
        <button
          type="button"
          className="min-h-11 md:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            setOpen((value) => !value);
          }}
        >
          {t('filters.toggle', { count: activeCount })}
        </button>
      </div>
      <div id={panelId} className={`${open ? 'flex' : 'hidden'} flex-col gap-2 md:flex md:flex-row md:flex-wrap md:items-end`}>
        {children}
        {activeCount > 0 ? (
          <button type="button" className="min-h-11" onClick={onClear}>
            {t('filters.clear')}
          </button>
        ) : null}
      </div>
    </search>
  );
}
```

`<search>` is a valid HTML element in React 19's DOM typings; if the project's
types lack it, use `<div role="search">`.

## components/users-filter-bar.tsx (feature)

```tsx
import { useTranslation } from 'react-i18next';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { FilterBar } from '@/components/filters/filter-bar';
import { FilterSelect } from '@/components/filters/filter-select';
import { SearchField } from '@/components/filters/search-field';
import { useUsersFilters } from '../hooks/filter/use-users-filters';
import { useRoleOptions } from '../hooks/query/use-role-options';
import { USER_STATUSES } from '../types/types';

export function UsersFilterBar() {
  const { t } = useTranslation();
  const filters = useUsersFilters();
  const roles = useRoleOptions(); // long staleTime; lookups rarely change

  return (
    <FilterBar
      label={t('users.filtersLabel')}
      activeCount={filters.activeCount}
      onClear={filters.clear}
      search={
        <SearchField
          value={filters.values.q}
          label={t('users.searchLabel')}
          clearLabel={t('filters.clearSearch')}
          onDebouncedChange={(q) => {
            filters.setFilters({ q }, { replace: true });
          }}
        />
      }
    >
      <FilterSelect
        label={t('users.status')}
        value={filters.values.status}
        options={[
          { value: 'all', label: t('filters.all') },
          ...USER_STATUSES.map((status) => ({ value: status, label: t(`users.status_${status}`) })),
        ]}
        onChange={(status) => {
          filters.setFilters({ status });
        }}
      />
      <FilterSelect
        label={t('users.role')}
        value={filters.values.roleId}
        isLoading={roles.isPending}
        isError={roles.isError}
        onRetry={() => {
          void roles.refetch();
        }}
        options={[{ value: '', label: t('filters.all') }, ...(roles.data ?? [])]}
        onChange={(roleId) => {
          filters.setFilters({ roleId });
        }}
      />
      <DateRangeFilter
        label={t('users.createdBetween')}
        from={filters.values.from}
        to={filters.values.to}
        onChange={(range) => {
          filters.setFilters(range);
        }}
      />
    </FilterBar>
  );
}
```

`FilterSelect<TValue extends string>` is generic so `onChange` receives the
schema's union (`'all' | UserStatus`), not `string`; it validates the picked
value against `options` instead of casting.
