import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { ClientDataTable } from '@/components/table/client-data-table';
import { ExportExcelButton } from '@/components/table/export-excel-button';
import { ListFiltersBar } from '@/components/table/list-filters-bar';
import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';
import { WarehouseFormDialog } from './components/dialog/warehouse-form-dialog';
import { useWarehousesListPage } from './hooks/use-warehouses-list-page';

export default function WarehousesListContainer() {
  const { t } = useTranslation();
  const page = useWarehousesListPage();

  return (
    <section dir={page.dir} className="gap-card flex flex-col">
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
            {page.canCreate ? (
              <Button type="button" onClick={page.formDialog.openCreate}>
                <Plus className="size-4" />
                {t('warehouses.add')}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="surface-card gap-card flex flex-col">
        <ListFiltersBar {...page.toolbar} />
        <ClientDataTable {...page.table} embedded />
      </div>

      <WarehouseFormDialog dialog={page.formDialog} />

      <ConfirmDialog
        open={page.deleteDialog.open}
        onOpenChange={page.deleteDialog.onOpenChange}
        title={t('warehouses.delete.title')}
        description={t('warehouses.delete.description', {
          name: page.deleteDialog.name,
        })}
        confirmLabel={t('warehouses.delete.confirm')}
        destructive
        isLoading={page.deleteDialog.isPending}
        onConfirm={page.deleteDialog.onConfirm}
      />
    </section>
  );
}
