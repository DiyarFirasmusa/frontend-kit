import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ResolvedTableFilter, ServerPagination } from '@/components/table/types';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { useDeleteTarget } from '@/shared/hooks/use-delete-target';
import { zodResolver } from '@/shared/lib/vendor/zod-resolver';
import { errorStatus } from '../api/errors';
import { useCan } from '../components/can';
import { PERMS } from '../constants/permissions';
import { reportSaveError } from '../lib/apply-field-errors';
import type { Supplier } from '../types/api';
import { toSupplierFormValues, toSupplierPayload } from './supplier-actions';
import { SUPPLIERS_PAGE_SIZE, suppliersListParams, type SuppliersSearch } from './supplier-search';
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliersList,
  useUpdateSupplier,
} from './use-supplier-queries';
import {
  EMPTY_SUPPLIER,
  SUPPLIER_FIELDS,
  supplierSchema,
  type SupplierValues,
} from './validations';

export type SuppliersPageProps = {
  /** The list state from the URL (the route parses it). */
  search: SuppliersSearch;
  /** Writes a new list state to the URL. */
  onSearchChange: (next: SuppliersSearch) => void;
};

/** Everything the suppliers page does; index.tsx only lays it out. */
export function useSuppliersPage({ search, onSearchChange }: SuppliersPageProps) {
  const { t } = useTranslation();
  const canWrite = useCan(PERMS.supplier.write);
  const canDelete = useCan(PERMS.supplier.delete);
  const page = search.page ?? 1;

  // The search box answers every key at once; the URL and the request follow after a short pause.
  // sentQuery is the text the URL holds, so typing and the back button never undo each other.
  const [searchText, setSearchText] = useState(search.q ?? '');
  const debouncedSearch = useDebouncedValue(searchText, 350);
  const sentQuery = useRef(search.q ?? '');
  const latest = useRef({ search, onSearchChange });
  useEffect(() => {
    latest.current = { search, onSearchChange };
  });
  useEffect(() => {
    const next = debouncedSearch.trim();
    if (next === sentQuery.current) {
      return;
    }
    sentQuery.current = next;
    const { search: current, onSearchChange: write } = latest.current;
    write({ ...current, q: next === '' ? undefined : next, page: undefined });
  }, [debouncedSearch]);
  useEffect(() => {
    const fromUrl = search.q ?? '';
    if (fromUrl !== sentQuery.current) {
      sentQuery.current = fromUrl;
      setSearchText(fromUrl);
    }
  }, [search.q]);

  const query = useSuppliersList(suppliersListParams(search));
  const total = query.data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / SUPPLIERS_PAGE_SIZE));

  // A page past the end (a typed URL, or the last row of the last page was deleted): a real backend answers
  // it with no rows, so go to the last page instead of showing "no suppliers" under a pager that says 3 of 2.
  // Only judged on real data, not on the previous page kept on screen while this one loads.
  const settled = query.isSuccess && !query.isPlaceholderData && !query.isFetching;
  useEffect(() => {
    if (settled && page > lastPage) {
      onSearchChange({ ...search, page: lastPage === 1 ? undefined : lastPage });
    }
  }, [settled, page, lastPage, search, onSearchChange]);

  const pagination: ServerPagination = {
    page: page - 1,
    pageSize: SUPPLIERS_PAGE_SIZE,
    total,
    totalPages: lastPage,
    onPageChange: (index) => {
      onSearchChange({ ...search, page: index === 0 ? undefined : index + 1 });
    },
  };

  const filters: ResolvedTableFilter[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('suppliers.filterStatus'),
        options: [
          { value: 'active', label: t('ui.active') },
          { value: 'inactive', label: t('ui.inactive') },
        ],
      },
    ],
    [t],
  );

  const onFilterChange = useCallback(
    (id: string, value: string) => {
      if (id === 'status') {
        const status = value === 'active' || value === 'inactive' ? value : undefined;
        onSearchChange({ ...search, status, page: undefined });
      }
    },
    [onSearchChange, search],
  );

  const clearFilters = useCallback(() => {
    setSearchText('');
    onSearchChange({});
  }, [onSearchChange]);

  // Create / edit dialog.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const form = useForm<SupplierValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: EMPTY_SUPPLIER,
  });
  const create = useCreateSupplier();
  const update = useUpdateSupplier();

  const openCreate = useCallback(() => {
    setEditing(null);
    form.reset(EMPTY_SUPPLIER);
    setDialogOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (row: Supplier) => {
      setEditing(row);
      form.reset(toSupplierFormValues(row));
      setDialogOpen(true);
    },
    [form],
  );

  const closeDialog = () => {
    setDialogOpen(false);
  };

  // The dialog stays open on an error: the backend's field errors appear under the inputs.
  const onError = (error: unknown) => {
    reportSaveError(form, error, SUPPLIER_FIELDS);
  };

  const submit = form.handleSubmit((values) => {
    const payload = toSupplierPayload(values);
    if (editing === null) {
      create.mutate(payload, { onSuccess: closeDialog, onError });
    } else {
      update.mutate({ id: editing.id, payload }, { onSuccess: closeDialog, onError });
    }
  });

  // Delete with confirm. The row is kept while the dialog closes, so its text does not flash.
  const remove = useDeleteSupplier();
  const { deleteTarget, isDeleteOpen, openDelete, closeDelete } = useDeleteTarget<Supplier>();
  const confirmDelete = () => {
    if (deleteTarget !== null) {
      remove.mutate(deleteTarget.id, { onSuccess: closeDelete });
    }
  };

  return {
    canWrite,
    canDelete,
    rows: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    /** The API said 403 for the list: show "no access", a retry cannot help. */
    isForbidden: errorStatus(query.error) === 403,
    refetch: () => {
      void query.refetch();
    },
    pagination,
    isFiltered: search.q !== undefined || search.status !== undefined,
    toolbar: {
      search: searchText,
      onSearchChange: setSearchText,
      searchPlaceholder: t('suppliers.searchPlaceholder'),
      filters,
      filterValues: { status: search.status ?? '' },
      onFilterChange,
      onClearFilters: clearFilters,
      isDirty: searchText !== '' || search.status !== undefined,
    },
    dialog: {
      open: dialogOpen,
      isEditing: editing !== null,
      form,
      isPending: create.isPending || update.isPending,
      openCreate,
      openEdit,
      onOpenChange: setDialogOpen,
      submit: () => {
        void submit();
      },
    },
    deleteDialog: {
      open: isDeleteOpen,
      name: deleteTarget?.name ?? '',
      isPending: remove.isPending,
      request: openDelete,
      onOpenChange: (open: boolean) => {
        if (!open) {
          closeDelete();
        }
      },
      onConfirm: confirmDelete,
    },
  };
}
