import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { ExportExcelButton } from '@/components/table/export-excel-button';
import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';
import { CategoryDetail } from './components/category-detail';
import { CategoryTreePanel } from './components/category-tree-panel';
import { AttachAttributeManager } from './components/dialog/attach-attribute-manager';
import { AttributeOptionsManager } from './components/dialog/attribute-options-manager';
import { CategoryBlockedDialog } from './components/dialog/category-blocked-dialog';
import { CategoryFormDialog } from './components/dialog/category-form-dialog';
import { useCategoriesPage } from './hooks/use-categories-page';

/** The category tree page: the tree on the side, the selected category beside it. */
export default function CategoriesContainer() {
  const { t } = useTranslation();
  const page = useCategoriesPage();
  const { dialog } = page;

  return (
    <section className="gap-card flex flex-col">
      <PageHeader
        breadcrumb={
          <Breadcrumb current={t('categories.title')}>
            <span>{t('nav.groups.products')}</span>
          </Breadcrumb>
        }
        title={t('categories.title')}
        subtitle={t('categories.subtitle')}
        actions={
          <>
            <ExportExcelButton {...page.exportExcel} />
            {page.can.create ? (
              <Button type="button" onClick={page.openCreate}>
                <Plus className="size-4" />
                {t('categories.actions.addCategory')}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="gap-card grid lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
        <CategoryTreePanel tree={page.tree} />
        <CategoryDetail page={page} />
      </div>

      {dialog.kind === 'create' ||
      dialog.kind === 'edit' ||
      dialog.kind === 'move' ? (
        <CategoryFormDialog
          key={
            dialog.kind === 'create'
              ? 'create'
              : `${dialog.kind}:${dialog.categoryId}`
          }
          mode={dialog}
          categories={page.categories}
          onClose={page.closeDialog}
          onSaved={page.onCategorySaved}
        />
      ) : null}

      {dialog.kind === 'attach' && page.tree.selectedId !== null ? (
        <AttachAttributeManager
          key={page.tree.selectedId}
          categoryId={page.tree.selectedId}
          linkedIds={page.linkedIds}
          sortOrder={page.assignments.rows.length}
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

      <CategoryBlockedDialog {...page.blockedDialog} />

      <ConfirmDialog
        open={page.deleteCategoryDialog.open}
        onOpenChange={page.deleteCategoryDialog.onOpenChange}
        title={t('categories.delete.title')}
        description={t('categories.delete.description', {
          name: page.deleteCategoryDialog.name,
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        isLoading={page.deleteCategoryDialog.isLoading}
        onConfirm={page.deleteCategoryDialog.onConfirm}
      />

      <ConfirmDialog
        open={page.detachDialog.open}
        onOpenChange={page.detachDialog.onOpenChange}
        title={t('categories.detach.title')}
        description={t('categories.detach.description', {
          name: page.detachDialog.name,
        })}
        confirmLabel={t('categories.detach.confirm')}
        cancelLabel={t('common.cancel')}
        destructive
        isLoading={page.detachDialog.isLoading}
        onConfirm={page.detachDialog.onConfirm}
      />
    </section>
  );
}
