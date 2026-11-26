import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';
import { PAGE_SIZES } from '@/lib/list-search';
import { AttributeOptionsManager } from '../../components/dialog/attribute-options-manager';
import { AttributeFilterBar } from './components/attribute-filter-bar';
import { AttributeFormDialog } from './components/dialog/attribute-form-dialog';
import {
  getAttributeRowId,
  useAttributesListPage,
} from './hooks/use-list-page';

/** The attribute definitions list: the second page of the categories feature. */
export default function AttributesListContainer() {
  const page = useAttributesListPage();
  const { t } = page;
  const { dialog } = page;

  const createButton = page.canCreate ? (
    <Button type="button" onClick={page.openCreate}>
      <Plus className="size-4" />
      {t('categories.actions.addAttribute')}
    </Button>
  ) : null;

  return (
    <section className="gap-card flex flex-col">
      <PageHeader
        breadcrumb={
          <Breadcrumb current={t('categories.attributes.title')}>
            <span>{t('nav.groups.products')}</span>
          </Breadcrumb>
        }
        title={t('categories.attributes.title')}
        subtitle={t('categories.attributes.description')}
        actions={createButton}
      />

      <div className="surface-card gap-card flex flex-col">
        <AttributeFilterBar />
        <DataTable
          caption={t('categories.attributes.caption')}
          columns={page.columns}
          rows={page.rows}
          rowCount={page.rowCount}
          getRowId={getAttributeRowId}
          pagination={page.pagination}
          sorting={page.sorting}
          onPaginationChange={page.setPagination}
          onSortingChange={page.setSorting}
          pageSizeOptions={PAGE_SIZES}
          status={page.status}
          onRetry={page.retry}
          emptyLabel={
            page.hasFilters
              ? t('categories.attributes.emptyFiltered')
              : t('categories.attributes.empty')
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

      {dialog.kind === 'create' || dialog.kind === 'edit' ? (
        <AttributeFormDialog
          key={dialog.kind === 'edit' ? `edit:${dialog.attributeId}` : 'create'}
          mode={dialog}
          onClose={page.closeDialog}
        />
      ) : null}

      {dialog.kind === 'options' ? (
        <AttributeOptionsManager
          key={dialog.attributeId}
          attributeId={dialog.attributeId}
          onClose={page.closeDialog}
        />
      ) : null}

      <ConfirmDialog
        open={page.deleteDialog.open}
        onOpenChange={page.deleteDialog.onOpenChange}
        title={t('categories.attributeDelete.title')}
        description={t('categories.attributeDelete.description', {
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
