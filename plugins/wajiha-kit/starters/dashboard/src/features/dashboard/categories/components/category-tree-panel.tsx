import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import type { CategoriesPage } from '../hooks/use-categories-page';
import { CategoryTree } from './category-tree';

/** The tree and its search box. The search box stays even when nothing matches. */
export function CategoryTreePanel({ tree }: { tree: CategoriesPage['tree'] }) {
  const { t } = useTranslation();
  const { query } = tree;

  return (
    <div className="surface-card gap-card flex min-w-0 flex-col">
      <h2 className="text-h4 text-text-primary">
        {t('categories.tree.title')}
      </h2>
      <Wrapper
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        data={query.data?.content}
        // An empty result of a search is not an empty tree: the box must stay.
        isEmpty={(rows) => rows.length === 0 && !tree.isSearching}
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
            nodes={tree.nodes}
            selectedId={tree.selectedId}
            onSelect={tree.select}
            search={tree.search}
            onSearchChange={tree.setSearch}
            isSearching={tree.isSearching}
            allRow={{
              count: tree.totalItemCount,
              selected: tree.isAllSelected,
              onSelect: tree.selectAll,
            }}
            getNodeActions={tree.getNodeActions}
          />
        )}
      </Wrapper>
    </div>
  );
}
