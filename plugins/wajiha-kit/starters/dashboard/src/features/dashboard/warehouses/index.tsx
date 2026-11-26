import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/table/data-table';
import { ExportExcelButton } from '@/components/table/export-excel-button';
import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';
import { PAGE_SIZES } from '@/lib/list-search';
import { WarehouseFormDialog } from './components/dialog/warehouse-form-dialog';
import { WarehouseFilterBar } from './components/warehouse-filter-bar';
import {
  getWarehouseRowId,
  useWarehousesListPage,
} from './hooks/use-list-page';

export default function WarehousesListContainer() {
  const page = useWarehousesListPage();
  const { t } = page;

  const createButton = page.canCreate ? (
    <Button type="button" onClick={page.openCreate}>
      <Plus className="size-4" />
      {t('warehouses.create')}
    </Button>
  ) : null;

  return (
    <section className="gap-card flex flex-col">
      <PageHeader
        breadcrumb={
          <Breadcrumb current={t('warehouses.title')}>
            <span>{t('nav.groups.warehouses')}</span>
          </Breadcrumb>
        }
        title={t('warehouses.title')}
        subtitle={t('warehouses.subtitle')}
        actions={
          <>
            <ExportExcelButton {...page.exportExcel} />
            {createButton}
          </>
        }
      />

      <div className="surface-card gap-card flex flex-col">
        <WarehouseFilterBar />
        <DataTable
          caption={t('warehouses.caption')}
          columns={page.columns}
          rows={page.rows}
          rowCount={page.rowCount}
          getRowId={getWarehouseRowId}
          pagination={page.pagination}
          sorting={page.sorting}
          onPaginationChange={page.setPagination}
          onSortingChange={page.setSorting}
          pageSizeOptions={PAGE_SIZES}
          status={page.status}
          onRetry={page.retry}
          emptyLabel={
            page.hasFilters
              ? t('warehouses.emptyFiltered')
              : t('warehouses.empty')
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
        <WarehouseFormDialog
          key={
            page.dialog.kind === 'edit'
              ? `edit:${page.dialog.warehouseId}`
              : 'create'
          }
          mode={page.dialog}
          onClose={page.closeDialog}
        />
      )}

      <ConfirmDialog
        open={page.deleteDialog.open}
        onOpenChange={page.deleteDialog.onOpenChange}
        title={t('warehouses.delete.title')}
        description={t('warehouses.delete.description', {
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
