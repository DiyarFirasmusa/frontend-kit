import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/table/data-table';
import { ExportExcelButton } from '@/components/table/export-excel-button';
import { ListFiltersBar } from '@/components/table/list-filters-bar';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Plus } from '@/lib/icons';
import { SupplierFormDialog } from './components/dialog/supplier-form-dialog';
import { getSupplierColumns } from './components/supplier-columns';
import { useSupplierFormDialog } from './hooks/form/use-supplier-form-dialog';
import {
  getSupplierRowId,
  useSuppliersListPage,
} from './hooks/use-suppliers-list-page';

export default function SuppliersListContainer() {
  const { t } = useTranslation();
  const page = useSuppliersListPage();
  const { dialog, deleteDialog } = page;

  const columns = useMemo(
    () =>
      getSupplierColumns({
        t,
        canWrite: page.canWrite,
        canDelete: page.canDelete,
        onEdit: dialog.openEdit,
        onRegister: dialog.openRegister,
        onRemove: deleteDialog.request,
      }),
    [
      t,
      page.canWrite,
      page.canDelete,
      dialog.openEdit,
      dialog.openRegister,
      deleteDialog.request,
    ],
  );

  const formDialog = useSupplierFormDialog({
    open: dialog.open,
    editing: dialog.editing,
    registering: dialog.registering,
    onDone: () => {
      dialog.onOpenChange(false);
    },
  });

  const isDeactivate = deleteDialog.mode === 'deactivate';

  return (
    <section dir={page.dir} className="gap-card flex flex-col">
      <PageHeader
        breadcrumb={
          <Breadcrumb current={t('suppliers.title')}>
            <span>{t('nav.groups.products')}</span>
          </Breadcrumb>
        }
        title={t('suppliers.title')}
        subtitle={t('suppliers.subtitle')}
        actions={
          <>
            <ExportExcelButton {...page.exportExcel} />
            {page.canWrite ? (
              <Button type="button" onClick={dialog.openCreate}>
                <Plus className="size-4" />
                {t('suppliers.create')}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="surface-card gap-card flex flex-col">
        <ListFiltersBar {...page.toolbar} />
        <DataTable
          embedded
          data={page.rows}
          columns={columns}
          getRowId={getSupplierRowId}
          isLoading={page.isLoading}
          isError={page.isError}
          errorLabel={t('common.loadError')}
          onRetry={page.refetch}
          serverPagination={page.tablePagination}
          noResultsLabel={
            page.isFiltered
              ? t('suppliers.emptyFiltered')
              : t('suppliers.empty')
          }
        />
      </div>

      <Form {...formDialog.form}>
        <SupplierFormDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          isEditing={dialog.editing !== null}
          control={formDialog.form.control}
          isPending={formDialog.isPending}
          onSubmit={formDialog.submit}
        />
      </Form>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.onOpenChange}
        title={
          isDeactivate
            ? t('suppliers.deactivate.title')
            : t('suppliers.delete.title')
        }
        description={
          isDeactivate
            ? t('suppliers.deactivate.description', { name: deleteDialog.name })
            : t('suppliers.delete.description', { name: deleteDialog.name })
        }
        confirmLabel={
          isDeactivate ? t('suppliers.actions.deactivate') : t('common.delete')
        }
        cancelLabel={t('common.cancel')}
        destructive
        isLoading={deleteDialog.isPending}
        onConfirm={deleteDialog.onConfirm}
      />
    </section>
  );
}
