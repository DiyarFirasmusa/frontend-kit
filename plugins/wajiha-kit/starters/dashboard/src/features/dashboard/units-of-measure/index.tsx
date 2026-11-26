import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { ClientDataTable } from '@/components/table/client-data-table';
import { ExportExcelButton } from '@/components/table/export-excel-button';
import { ListFiltersBar } from '@/components/table/list-filters-bar';
import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';
import { UnitOfMeasureFormDialog } from './components/dialog/uom-form-dialog';
import { useUnitsOfMeasureListPage } from './hooks/use-units-of-measure-list-page';

export default function UnitsOfMeasureListContainer() {
  const { t } = useTranslation();
  const page = useUnitsOfMeasureListPage();

  return (
    <section dir={page.dir} className="gap-card flex flex-col">
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
            {page.canCreate ? (
              <Button type="button" onClick={page.formDialog.openCreate}>
                <Plus className="size-4" />
                {t('unitsOfMeasure.add')}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="surface-card gap-card flex flex-col">
        <ListFiltersBar {...page.toolbar} />
        <ClientDataTable {...page.table} embedded />
      </div>

      <UnitOfMeasureFormDialog dialog={page.formDialog} />

      <ConfirmDialog
        open={page.deleteDialog.open}
        onOpenChange={page.deleteDialog.onOpenChange}
        title={t('unitsOfMeasure.delete.title')}
        description={t('unitsOfMeasure.delete.description', {
          name: page.deleteDialog.name,
        })}
        confirmLabel={t('unitsOfMeasure.delete.confirm')}
        destructive
        isLoading={page.deleteDialog.isPending}
        onConfirm={page.deleteDialog.onConfirm}
      />
    </section>
  );
}
