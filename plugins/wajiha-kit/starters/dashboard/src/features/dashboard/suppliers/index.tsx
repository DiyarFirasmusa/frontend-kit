import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/table/data-table';
import { ExportExcelButton } from '@/components/table/export-excel-button';
import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';
import { PAGE_SIZES } from '@/lib/list-search';
import { SupplierFormDialog } from './components/dialog/supplier-form-dialog';
import { SupplierFilterBar } from './components/supplier-filter-bar';
import { getSupplierRowId, useSuppliersListPage } from './hooks/use-list-page';

/** The reference list page: copy this feature folder for a new entity. */
export default function SuppliersListContainer() {
  const page = useSuppliersListPage();
  const { t } = page;

  const createButton = page.canCreate ? (
    <Button type="button" onClick={page.openCreate}>
      <Plus className="size-4" />
      {t('suppliers.create')}
    </Button>
  ) : null;

  return (
    <section className="gap-card flex flex-col">
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
            {createButton}
          </>
        }
      />

      <div className="surface-card gap-card flex flex-col">
        <SupplierFilterBar />
        <DataTable
          caption={t('suppliers.caption')}
          columns={page.columns}
          rows={page.rows}
          rowCount={page.rowCount}
          getRowId={getSupplierRowId}
          pagination={page.pagination}
          sorting={page.sorting}
          onPaginationChange={page.setPagination}
          onSortingChange={page.setSorting}
          pageSizeOptions={PAGE_SIZES}
          status={page.status}
          onRetry={page.retry}
          emptyLabel={
            page.hasFilters
              ? t('suppliers.emptyFiltered')
              : t('suppliers.empty')
          }
          emptyAction={
            page.hasFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={page.clearFilters}
              >
                {t('table.clearFilters')}
              </Button>
            ) : (
              createButton
            )
          }
        />
      </div>

      {page.dialog.kind === 'closed' ? null : (
        <SupplierFormDialog
          key={
            page.dialog.kind === 'edit'
              ? `edit:${page.dialog.supplierId}`
              : 'create'
          }
          mode={page.dialog}
          onClose={page.closeDialog}
        />
      )}

      <ConfirmDialog
        open={page.deleteDialog.open}
        onOpenChange={page.deleteDialog.onOpenChange}
        title={t('suppliers.delete.title')}
        description={t('suppliers.delete.description', {
          name: page.deleteDialog.name,
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        isLoading={page.deleteDialog.isLoading}
        onConfirm={page.deleteDialog.onConfirm}
      />
    </section>
  );
}
