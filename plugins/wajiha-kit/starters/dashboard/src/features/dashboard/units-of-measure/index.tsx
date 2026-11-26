import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/table/data-table';
import { ExportExcelButton } from '@/components/table/export-excel-button';
import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';
import { PAGE_SIZES } from '@/lib/list-search';
import { UnitOfMeasureFormDialog } from './components/dialog/uom-form-dialog';
import { UnitOfMeasureFilterBar } from './components/uom-filter-bar';
import {
  getUnitOfMeasureRowId,
  useUnitsOfMeasureListPage,
} from './hooks/use-list-page';

export default function UnitsOfMeasureListContainer() {
  const page = useUnitsOfMeasureListPage();
  const { t } = page;

  const createButton = page.canCreate ? (
    <Button type="button" onClick={page.openCreate}>
      <Plus className="size-4" />
      {t('unitsOfMeasure.create')}
    </Button>
  ) : null;

  return (
    <section className="gap-card flex flex-col">
      <PageHeader
        breadcrumb={
          <Breadcrumb current={t('unitsOfMeasure.title')}>
            <span>{t('nav.groups.products')}</span>
          </Breadcrumb>
        }
        title={t('unitsOfMeasure.title')}
        subtitle={t('unitsOfMeasure.subtitle')}
        actions={
          <>
            <ExportExcelButton {...page.exportExcel} />
            {createButton}
          </>
        }
      />

      <div className="surface-card gap-card flex flex-col">
        <UnitOfMeasureFilterBar />
        <DataTable
          caption={t('unitsOfMeasure.caption')}
          columns={page.columns}
          rows={page.rows}
          rowCount={page.rowCount}
          getRowId={getUnitOfMeasureRowId}
          pagination={page.pagination}
          sorting={page.sorting}
          onPaginationChange={page.setPagination}
          onSortingChange={page.setSorting}
          pageSizeOptions={PAGE_SIZES}
          status={page.status}
          onRetry={page.retry}
          emptyLabel={
            page.hasFilters
              ? t('unitsOfMeasure.emptyFiltered')
              : t('unitsOfMeasure.empty')
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
        <UnitOfMeasureFormDialog
          key={
            page.dialog.kind === 'edit'
              ? `edit:${page.dialog.unitId}`
              : 'create'
          }
          mode={page.dialog}
          onClose={page.closeDialog}
        />
      )}

      <ConfirmDialog
        open={page.deleteDialog.open}
        onOpenChange={page.deleteDialog.onOpenChange}
        title={t('unitsOfMeasure.delete.title')}
        description={t('unitsOfMeasure.delete.description', {
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
