# List feature, end to end (example entity: users)

Names are examples; field names, paging and sort format must mirror the
project's OpenAPI. Paths are relative to `src/features/app/users/`.

## types/types.ts

```ts
export const USER_STATUSES = ['active', 'disabled'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface UserRow {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserListParams {
  page: number; // 1-based, as in the URL
  pageSize: number;
  sort: string; // '<columnId>.<asc|desc>' or ''
  q: string;
  status: UserStatus | 'all';
}

export interface UserListResponse {
  content: UserRow[];
  totalElements: number;
  totalPages: number;
}
```

## utils/list-params.ts

```ts
import type { UserSearch } from '../validations/search';
import type { UserListParams } from '../types/types';

// Only the fields the request uses: loaderDeps and the query key both come from here.
export function toUserListParams(search: UserSearch): UserListParams {
  return {
    page: search.page,
    pageSize: search.pageSize,
    sort: search.sort,
    q: search.q,
    status: search.status,
  };
}
```

## services/users.service.ts

```ts
import { privateApi } from '@/api/client/private';
import { endpoints } from '@/constants/api';
import type { UserListParams, UserListResponse } from '../types/types';

// Backend is 0-based and wants `sort=name,asc`; the UI never sees that.
function toUserListQuery(params: UserListParams): Record<string, string | number> {
  const query: Record<string, string | number> = { page: params.page - 1, size: params.pageSize };
  if (params.sort) {
    query.sort = params.sort.replace('.', ',');
  }
  if (params.q) {
    query.search = params.q;
  }
  if (params.status !== 'all') {
    query.status = params.status;
  }
  return query;
}

export async function fetchUsers(params: UserListParams, options?: { signal?: AbortSignal }): Promise<UserListResponse> {
  const { data } = await privateApi.get<UserListResponse>(endpoints.users.list, {
    params: toUserListQuery(params),
    signal: options?.signal,
  });
  return data;
}
```

## hooks/query/use-users-list.ts

```ts
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchUsers } from '../../services/users.service';
import type { UserListParams } from '../../types/types';

export function usersListQueryOptions(params: UserListParams) {
  return queryOptions({
    queryKey: qk.users.list(params),
    queryFn: ({ signal }) => fetchUsers(params, { signal }),
    placeholderData: keepPreviousData,
  });
}

export function useUsersList(params: UserListParams) {
  return useQuery(usersListQueryOptions(params));
}
```

## hooks/users-actions.ts

```ts
import type { Permission } from '@/constants/permissions';
import { PERMS } from '@/constants/permissions';
import type { RowAction } from '@/types/table';
import type { UserRow } from '../types/types';

interface UserActionDeps {
  can: (permission: Permission) => boolean;
  onEdit: (row: UserRow) => void;
  onDelete: (row: UserRow) => void;
}

export function getUserRowActions(row: UserRow, deps: UserActionDeps): RowAction[] {
  const actions: RowAction[] = [];
  if (deps.can(PERMS.users.update)) {
    actions.push({ id: 'edit', labelKey: 'users.edit', icon: 'edit', onSelect: () => { deps.onEdit(row); } });
  }
  if (deps.can(PERMS.users.delete)) {
    actions.push({
      id: 'delete',
      labelKey: 'users.delete',
      icon: 'delete',
      tone: 'danger',
      // Allowed in general, not for this row: aria-disabled with the reason, and the click does nothing (data-table.md).
      disabledReasonKey: row.status === 'active' ? 'users.deleteActiveBlocked' : undefined,
      onSelect: () => { deps.onDelete(row); },
    });
  }
  return actions;
}
```

`RowAction` lives in `src/types/table.ts`:
`{ id: string; labelKey: string; icon: IconName; tone?: 'danger'; disabledReasonKey?: string; onSelect: () => void }`.

## components/users-columns.tsx

```tsx
import { createColumnHelper } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Link } from '@tanstack/react-router';
import { DataTableRowActions } from '@/components/table/data-table-row-actions';
import { StatusBadge } from '@/components/ui/status-badge';
import type { DataTableFeatures } from '@/components/table/table-features';
import type { RowAction } from '@/types/table';
import { formatDateTime } from '@/utils/format';
import { USER_STATUS_TONE } from '../utils/tones';
import type { UserRow } from '../types/types';

const helper = createColumnHelper<DataTableFeatures, UserRow>();

interface UserColumnsDeps {
  t: TFunction;
  locale: string;
  getActions: (row: UserRow) => RowAction[];
}

export function getUserColumns({ t, locale, getActions }: UserColumnsDeps) {
  return helper.columns([
    // `id` = the backend sort key, so the URL sort maps straight through.
    helper.accessor('name', {
      id: 'name',
      header: t('users.colName'),
      cell: ({ row }) => (
        <Link to="/users/$userId" params={{ userId: row.original.id }} className="font-medium underline-offset-4 hover:underline">
          {row.original.name}
        </Link>
      ),
    }),
    helper.accessor('email', {
      header: t('users.colEmail'),
      enableSorting: false,
      cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
      meta: { hideBelow: 'md' },
    }),
    helper.accessor('status', {
      header: t('users.colStatus'),
      cell: ({ getValue }) => (
        <StatusBadge tone={USER_STATUS_TONE[getValue()]}>{t(`users.status_${getValue()}`)}</StatusBadge>
      ),
    }),
    helper.accessor('lastLoginAt', {
      header: t('users.colLastLogin'),
      cell: ({ getValue }) => <span className="tabular-nums">{formatDateTime(getValue(), locale)}</span>,
      meta: { hideBelow: 'lg' },
    }),
    helper.display({
      id: 'actions',
      header: () => <span className="sr-only">{t('users.colActions')}</span>,
      cell: ({ row }) => <DataTableRowActions actions={getActions(row.original)} rowLabel={row.original.name} />,
      meta: { align: 'end' },
    }),
  ]);
}
```

`formatDateTime(null)` returns `'—'`. The status label keys are static strings
in the locale files (`status_active`, `status_disabled`); if the project's
i18n rule forbids template keys, use a `Record<UserStatus, string>` of keys.

## hooks/use-list-page.ts

```ts
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { getRouteApi } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMS } from '@/constants/permissions';
import { useCan } from '@/hooks/use-can';
import { toPaginationState, toSortParam, toSortingState, toTableStatus } from '@/utils/table-state';
import { getUserColumns } from '../components/users-columns';
import { useUsersList } from './query/use-users-list';
import { getUserRowActions } from './users-actions';
import { toUserListParams } from '../utils/list-params';
import type { UserRow } from '../types/types';
import type { UserDialogState } from './form/use-user-form-dialog';

const routeApi = getRouteApi('/_app/users/');
const NO_ROWS: UserRow[] = [];

export function useUsersListPage() {
  const { t, i18n } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const can = useCan();
  const query = useUsersList(toUserListParams(search));
  const [dialog, setDialog] = useState<UserDialogState>({ kind: 'closed' });
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);

  const pagination = useMemo(() => toPaginationState(search.page, search.pageSize), [search.page, search.pageSize]);
  const sorting = useMemo(() => toSortingState(search.sort), [search.sort]);

  const getActions = useCallback(
    (row: UserRow) =>
      getUserRowActions(row, {
        can,
        onEdit: (target) => { setDialog({ kind: 'edit', userId: target.id }); },
        onDelete: setPendingDelete,
      }),
    [can],
  );
  const columns = useMemo(
    () => getUserColumns({ t, locale: i18n.language, getActions }),
    [t, i18n.language, getActions],
  );

  const setPagination = (next: PaginationState) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        pageSize: next.pageSize,
        // A new page size starts over; otherwise go to the requested page.
        page: next.pageSize === prev.pageSize ? next.pageIndex + 1 : 1,
      }),
    });
  };
  const setSorting = (next: SortingState) => {
    void navigate({ search: (prev) => ({ ...prev, sort: toSortParam(next), page: 1 }) });
  };

  // A shared link or a delete can leave the page past the end; snap back.
  const totalPages = query.data?.totalPages;
  useEffect(() => {
    if (totalPages !== undefined && totalPages > 0 && search.page > totalPages) {
      void navigate({ search: (prev) => ({ ...prev, page: totalPages }), replace: true });
    }
  }, [totalPages, search.page, navigate]);

  return {
    t,
    rows: query.data?.content ?? NO_ROWS,
    rowCount: query.data?.totalElements,
    status: toTableStatus(query),
    retry: () => { void query.refetch(); },
    columns,
    pagination,
    sorting,
    setPagination,
    setSorting,
    canCreate: can(PERMS.users.create),
    openCreate: () => { setDialog({ kind: 'create' }); },
    dialog,
    closeDialog: () => { setDialog({ kind: 'closed' }); },
    pendingDelete,
    closeDelete: () => { setPendingDelete(null); },
    hasFilters: search.q !== '' || search.status !== 'all',
  };
}
```

The container renders `empty` from `hasFilters`: "no results" + clear filters
when filtered, otherwise the empty message + the create button when
`canCreate`. Dialogs and delete confirmation: `dash-create-crud`.

## locales (both files, same keys)

```json
{
  "users": {
    "title": "المستخدمون",
    "caption": "قائمة المستخدمين",
    "colName": "الاسم",
    "empty": "لا يوجد مستخدمون بعد",
    "noResults": "لا توجد نتائج مطابقة",
    "clearFilters": "مسح عوامل التصفية"
  }
}
```

Key depth and naming follow the shared i18n rule.
