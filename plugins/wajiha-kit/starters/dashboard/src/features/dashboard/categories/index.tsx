import type { useTranslation as useTranslationType } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/table/data-table';
import { ExportExcelButton } from '@/components/table/export-excel-button';
import { ListFiltersBar } from '@/components/table/list-filters-bar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TabPanel } from '@/components/ui/tabs';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { ArrowRightLong, FileText, Plus, Trash2 } from '@/lib/icons';
import { AttributeDataTypeValues } from '@/types/api/enums';
import type { AttributeDataType } from '@/types/api/enums';
import type { ResolvedTableFilter } from '@/types/table';
import { CategoryTree } from './components/category-tree';
import { AttachAttributeDialog } from './components/dialog/attach-attribute-dialog';
import { AttributeFormDialog } from './components/dialog/attribute-form-dialog';
import { AttributeOptionsDialog } from './components/dialog/attribute-options-dialog';
import { CategoryBlockedDialog } from './components/dialog/category-blocked-dialog';
import { CategoryFormDialog } from './components/dialog/category-form-dialog';
import type {
  CategoriesConfirmState,
  CategoriesPage,
} from './hooks/use-categories-page';
import { useCategoriesPage } from './hooks/use-categories-page';
import type { CategoriesTab } from './types/types';

type TFn = ReturnType<typeof useTranslationType>['t'];

interface CategoriesContainerProps {
  initialTab: CategoriesTab;
}

export default function CategoriesContainer({
  initialTab,
}: CategoriesContainerProps) {
  const { t } = useTranslation();
  const page = useCategoriesPage(initialTab);

  return (
    <section dir={page.dir} className="gap-card flex flex-col">
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
            {page.tab === 'categories' ? (
              <ExportExcelButton {...page.exportExcel} />
            ) : null}
            {page.canWriteAttribute ? (
              <Button
                type="button"
                variant={page.tab === 'attributes' ? 'default' : 'outline'}
                onClick={page.onAddAttribute}
              >
                <Plus className="size-4" />
                {t('categories.actions.addAttribute')}
              </Button>
            ) : null}
            {page.canWriteCategory ? (
              <Button
                type="button"
                variant={page.tab === 'categories' ? 'default' : 'outline'}
                onClick={page.onAddCategory}
              >
                <Plus className="size-4" />
                {t('categories.actions.addCategory')}
              </Button>
            ) : null}
          </>
        }
      />

      <TabPanel value="categories" active={page.tab === 'categories'}>
        <div className="gap-card grid lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
          <TreePanel page={page} />
          <CategoryDetail page={page} />
        </div>
      </TabPanel>

      <TabPanel
        value="attributes"
        active={page.tab === 'attributes' && page.showAttributesTab}
      >
        <AttributesPanel page={page} />
      </TabPanel>

      <CategoryFormDialog {...page.categoryDialog} />
      <CategoryBlockedDialog {...page.blockedDialog} />
      <AttachAttributeDialog {...page.attachDialog} />
      <AttributeFormDialog {...page.attributeDialog} />
      <AttributeOptionsDialog {...page.optionsDialog} />

      <ConfirmDialog
        open={page.confirm.open}
        onOpenChange={page.confirm.onOpenChange}
        {...getConfirmCopy(page.confirm, t)}
        destructive
        isLoading={page.confirm.isPending}
        onConfirm={page.confirm.onConfirm}
      />
    </section>
  );
}

function getConfirmCopy(confirm: CategoriesConfirmState, t: TFn) {
  switch (confirm.kind) {
    case 'category':
      return {
        title: t('categories.delete.title'),
        description: t('categories.delete.description', { name: confirm.name }),
        confirmLabel: t('categories.delete.confirm'),
      };
    case 'assignment':
      return {
        title: t('categories.detach.title'),
        description: t('categories.detach.description', { name: confirm.name }),
        confirmLabel: t('categories.detach.confirm'),
      };
    case 'attribute':
      return {
        title: t('categories.attributeDelete.title'),
        description: t('categories.attributeDelete.description', {
          name: confirm.name,
        }),
        confirmLabel: t('categories.attributeDelete.confirm'),
      };
  }
}

function TreePanel({ page }: { page: CategoriesPage }) {
  const { t } = useTranslation();
  const { categories } = page;
  const query = categories.query;

  return (
    <div className="surface-card gap-card flex min-w-0 flex-col">
      <h2 className="text-h4 text-text-primary">
        {t('categories.tree.title')}
      </h2>
      <Wrapper
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        data={query.data}
        isEmpty={(data) => data.length === 0}
        loadingFallback={
          <div
            role="status"
            aria-busy="true"
            className="gap-field flex flex-col"
          >
            <span className="sr-only">{t('common.loading')}</span>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-9 w-3/5" />
          </div>
        }
        emptyMessage={t('categories.tree.empty')}
        errorMessage={t('common.loadError')}
        onRetry={() => {
          void query.refetch();
        }}
      >
        {() => (
          <CategoryTree
            nodes={categories.nodes}
            selectedId={categories.selectedId}
            onSelect={categories.select}
            search={categories.search}
            onSearchChange={categories.setSearch}
            isSearching={categories.isSearching}
            allRow={{
              count: categories.totalItemCount,
              selected: categories.isAllSelected,
              onSelect: categories.selectAll,
            }}
            getNodeActions={categories.getNodeActions}
          />
        )}
      </Wrapper>
    </div>
  );
}

function CategoryDetail({ page }: { page: CategoriesPage }) {
  const { t } = useTranslation();
  const { categories, assignments } = page;
  const selected = categories.selectedCategory;

  if (categories.isAllSelected) {
    return (
      <section
        aria-label={t('categories.detail.title')}
        className="surface-card gap-field flex min-w-0 flex-col"
      >
        <h2 className="text-h3 text-text-primary">
          {t('categories.tree.all')}
        </h2>
        {categories.totalItemCount !== null ? (
          <p className="text-b2 text-text-primary tabular-nums">
            {t('categories.detail.allCount', {
              count: categories.totalItemCount,
            })}
          </p>
        ) : null}
        <p className="text-b2 text-text-secondary">
          {t('categories.detail.allDescription')}
        </p>
      </section>
    );
  }

  if (!selected) {
    return (
      <div className="surface-card flex min-w-0 flex-col">
        <p className="text-b2 text-text-secondary">
          {t('categories.detail.empty')}
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label={t('categories.detail.title')}
      className="surface-card gap-card flex min-w-0 flex-col"
    >
      <div className="border-stroke gap-field pb-row flex flex-wrap items-start justify-between border-b">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-b3 text-text-secondary">
            {t('categories.detail.title')}
          </span>
          <h2 className="text-h3 text-text-primary">{selected.name ?? '—'}</h2>
          <p className="text-b3 text-text-secondary">
            <span className="sr-only">{t('categories.detail.path')}: </span>
            {categories.selectedPath || '—'}
          </p>
          <p className="text-b3 text-text-secondary">
            {t('categories.detail.expiryAlertDays')}:{' '}
            <span className="text-text-primary tabular-nums">
              {typeof selected.expiryAlertDays === 'number' &&
              selected.expiryAlertDays > 0
                ? t('categories.detail.expiryAlertDaysValue', {
                    days: selected.expiryAlertDays,
                  })
                : '—'}
            </span>
          </p>
        </div>
        <div className="gap-field flex flex-wrap items-center">
          {page.canWriteCategory ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={categories.onEditSelected}
              >
                <FileText className="size-4" />
                {t('common.edit')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={categories.onMoveSelected}
              >
                <ArrowRightLong className="size-4 rtl:rotate-180" />
                {t('categories.actions.move')}
              </Button>
            </>
          ) : null}
          {page.canDeleteCategory ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={categories.onDeleteSelected}
            >
              <Trash2 className="size-4" />
              {t('common.delete')}
            </Button>
          ) : null}
        </div>
      </div>

      <section className="gap-field flex flex-col">
        <div className="gap-field flex flex-wrap items-start justify-between">
          <div className="gap-field flex min-w-0 flex-col">
            <h3 className="text-h4 text-text-primary">
              {t('categories.assignments.title')}
            </h3>
            <p className="text-b3 text-text-secondary">
              {t('categories.assignments.description')}
            </p>
          </div>
          {page.canWriteCategory ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={assignments.onAttachClick}
            >
              <Plus className="size-4" />
              {t('categories.assignments.attach')}
            </Button>
          ) : null}
        </div>
        <DataTable
          data={assignments.rows}
          columns={assignments.columns}
          getRowId={(row) => row.id}
          isLoading={assignments.query.isLoading}
          isError={assignments.query.isError}
          errorLabel={t('common.loadError')}
          onRetry={() => {
            void assignments.query.refetch();
          }}
          noResultsLabel={t('categories.assignments.empty')}
        />
      </section>
    </section>
  );
}

function AttributesPanel({ page }: { page: CategoriesPage }) {
  const { t } = useTranslation();
  const { attributes } = page;
  const filters = attributes.filters;

  const dataTypeFilter: ResolvedTableFilter = {
    id: 'dataType',
    label: t('categories.attributes.filter.dataType'),
    options: [
      { value: '', label: t('categories.attributes.filter.allTypes') },
      ...AttributeDataTypeValues.map((value: AttributeDataType) => ({
        value,
        label: t(`enums.AttributeDataType.${value}`),
      })),
    ],
  };
  const statusFilter: ResolvedTableFilter = {
    id: 'status',
    label: t('categories.attributes.filter.status'),
    options: [
      { value: '', label: t('categories.attributes.filter.allStatuses') },
      { value: 'ACTIVE', label: t('common.active') },
      { value: 'INACTIVE', label: t('common.inactive') },
    ],
  };

  return (
    <div className="gap-card flex flex-col">
      <div className="gap-field flex flex-col">
        <h2 className="text-h3 text-text-primary">
          {t('categories.attributes.title')}
        </h2>
        <p className="text-b2 text-text-secondary">
          {t('categories.attributes.description')}
        </p>
      </div>
      <div className="surface-card gap-card flex min-w-0 flex-col">
        <ListFiltersBar
          search={filters.search}
          onSearchChange={filters.setSearch}
          searchPlaceholder={t('categories.attributes.searchPlaceholder')}
          filters={[dataTypeFilter, statusFilter]}
          filterValues={{ dataType: filters.dataType, status: filters.status }}
          onFilterChange={(id, value) => {
            if (id === 'dataType') {
              filters.setDataType(value as AttributeDataType | '');
            } else {
              filters.setStatus(value as '' | 'ACTIVE' | 'INACTIVE');
            }
          }}
          onClearFilters={filters.clear}
          isDirty={filters.isDirty}
        />
        <DataTable
          embedded
          data={attributes.rows}
          columns={attributes.columns}
          getRowId={(row) => row.id}
          isLoading={attributes.query.isLoading}
          isError={attributes.query.isError}
          errorLabel={t('common.loadError')}
          onRetry={() => {
            void attributes.query.refetch();
          }}
          noResultsLabel={t('categories.attributes.empty')}
        />
      </div>
    </div>
  );
}
