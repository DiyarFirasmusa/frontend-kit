import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { DataTable } from '@/components/table/data-table';
import { ListFiltersBar } from '@/components/table/list-filters-bar';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Plus } from '@/components/ui/icons';
import { toLocale } from '@/shared/lib/i18n/languages';
import { Can } from '../components/can';
import { PERMS } from '../constants/permissions';
import type { Supplier } from '../types/api';
import { getSupplierColumns } from './supplier-columns';
import { SupplierFormDialog } from './supplier-form-dialog';
import { useSuppliersPage, type SuppliersPageProps } from './use-suppliers-page';

const rowId = (row: Supplier) => row.id;

export function SuppliersPage(props: SuppliersPageProps) {
  const { t, i18n } = useTranslation();
  const locale = toLocale(i18n.language);
  const page = useSuppliersPage(props);
  const { dialog, deleteDialog } = page;

  const columns = useMemo(
    () =>
      getSupplierColumns({
        t,
        locale,
        canWrite: page.canWrite,
        canDelete: page.canDelete,
        onEdit: dialog.openEdit,
        onDelete: deleteDialog.request,
      }),
    [t, locale, page.canWrite, page.canDelete, dialog.openEdit, deleteDialog.request],
  );

  return (
    <section className="gap-card flex flex-col">
      <header className="gap-row flex flex-wrap items-end justify-between">
        <div>
          <h1 className="page-title">{t('suppliers.title')}</h1>
          <p className="page-subtitle">{t('suppliers.subtitle')}</p>
        </div>
        <Can permission={PERMS.supplier.write}>
          <Button type="button" onClick={dialog.openCreate}>
            <Plus className="size-4" />
            {t('suppliers.create')}
          </Button>
        </Can>
      </header>

      <div className="surface-card gap-card flex flex-col">
        <ListFiltersBar {...page.toolbar} />
        <DataTable
          embedded
          data={page.rows}
          columns={columns}
          getRowId={rowId}
          isLoading={page.isLoading}
          isError={page.isError}
          errorLabel={page.isForbidden ? t('adminErrors.forbidden') : t('suppliers.loadError')}
          {...(page.isForbidden ? {} : { onRetry: page.refetch })}
          serverPagination={page.pagination}
          noResultsLabel={page.isFiltered ? t('suppliers.emptyFiltered') : t('suppliers.empty')}
        />
      </div>

      <Form {...dialog.form}>
        <SupplierFormDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          isEditing={dialog.isEditing}
          control={dialog.form.control}
          isPending={dialog.isPending}
          onSubmit={dialog.submit}
        />
      </Form>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.onOpenChange}
        title={t('suppliers.deleteTitle')}
        description={t('suppliers.deleteDescription', { name: deleteDialog.name })}
        confirmLabel={t('suppliers.delete')}
        cancelLabel={t('ui.cancel')}
        destructive
        isLoading={deleteDialog.isPending}
        onConfirm={deleteDialog.onConfirm}
      />
    </section>
  );
}
