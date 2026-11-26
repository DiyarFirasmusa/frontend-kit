import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchField } from '@/components/filters/search-field';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { DataTableRowActions } from '@/components/table/data-table-row-actions';
import { Button } from '@/components/ui/button';
import { ChevronDown, Layers, Tag } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { CategoryTreeNode } from '../types/types';

export interface CategoryTreeProps {
  nodes: CategoryTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** The committed search text (the URL's `q`). */
  search: string;
  /** Called once typing pauses; the page writes it to the URL. */
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  /** The "All items" root row (11.01); omitted when the tree has no total. */
  allRow?: {
    count: number | null;
    selected: boolean;
    onSelect: () => void;
  };
  /** The "⋯" menu of a node; no menu when it returns an empty list. */
  getNodeActions?: (id: string) => RowAction[];
}

const ROW_CLASS =
  'hover:bg-hover-row focus-visible:ring-ring gap-field flex min-h-11 min-w-0 flex-1 items-center rounded-lg border-s-2 px-2 py-1.5 text-start outline-none focus-visible:ring-2';

const EMPTY_SET: ReadonlySet<string> = new Set();

interface TreeListProps {
  nodes: CategoryTreeNode[];
  selectedId: string | null;
  collapsedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  toggleDisabled: boolean;
  getNodeActions?: (id: string) => RowAction[];
  nested?: boolean;
}

function TreeList({
  nodes,
  selectedId,
  collapsedIds,
  onToggle,
  onSelect,
  toggleDisabled,
  getNodeActions,
  nested = false,
}: TreeListProps) {
  const { t } = useTranslation();
  return (
    <ul className={cn('flex flex-col gap-1', nested && 'ps-5')}>
      {nodes.map((node) => {
        const { id, category } = node;
        const hasChildren = node.children.length > 0;
        const expanded = !collapsedIds.has(id);
        const selected = selectedId === id;
        const actions = getNodeActions?.(id) ?? [];
        return (
          <li key={id}>
            <div className="flex items-center gap-1">
              {hasChildren ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-expanded={expanded}
                  disabled={toggleDisabled}
                  aria-label={t(
                    expanded
                      ? 'categories.tree.collapse'
                      : 'categories.tree.expand',
                  )}
                  onClick={() => {
                    onToggle(id);
                  }}
                >
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform',
                      !expanded && '-rotate-90 rtl:rotate-90',
                    )}
                    aria-hidden
                  />
                </Button>
              ) : (
                <span className="size-8 shrink-0" aria-hidden />
              )}
              <button
                type="button"
                className={cn(
                  ROW_CLASS,
                  selected
                    ? 'border-primary-highlight bg-hover-row'
                    : 'border-transparent',
                )}
                aria-pressed={selected}
                onClick={() => {
                  onSelect(id);
                }}
              >
                {selected ? (
                  <Tag
                    className="text-text-primary size-4 shrink-0"
                    aria-hidden
                  />
                ) : (
                  <Layers
                    className="text-text-secondary size-4 shrink-0"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'text-text-primary min-w-0 truncate',
                    selected ? 'text-h5' : 'text-b2',
                  )}
                  title={category.code ?? undefined}
                >
                  {category.name ?? '—'}
                </span>
                {typeof category.itemCount === 'number' ? (
                  <span className="text-b3 text-text-muted ms-auto tabular-nums">
                    <span aria-hidden>{category.itemCount}</span>
                    <span className="sr-only">
                      {t('categories.tree.itemCount', {
                        count: category.itemCount,
                      })}
                    </span>
                  </span>
                ) : null}
              </button>
              {actions.length > 0 ? (
                <DataTableRowActions
                  variant="menu"
                  actions={actions}
                  menuLabel={`${t('common.actions')}: ${category.name ?? ''}`}
                />
              ) : null}
            </div>
            {hasChildren && expanded ? (
              <TreeList
                nested
                nodes={node.children}
                selectedId={selectedId}
                collapsedIds={collapsedIds}
                onToggle={onToggle}
                onSelect={onSelect}
                toggleDisabled={toggleDisabled}
                getNodeActions={getNodeActions}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function CategoryTree({
  nodes,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  isSearching,
  allRow,
  getNodeActions,
}: CategoryTreeProps) {
  const { t } = useTranslation();
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  // While a search is active every ancestor of a match must be visible, so the
  // user's manual collapse state is ignored and the toggles are disabled until
  // the search is cleared.
  const effectiveCollapsed = isSearching ? EMPTY_SET : collapsedIds;

  function handleToggle(id: string) {
    if (isSearching) {
      return;
    }
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <SearchField
        value={search}
        onCommit={onSearchChange}
        placeholder={t('categories.tree.searchPlaceholder')}
        label={t('categories.tree.searchPlaceholder')}
        // In a column the default flex-basis would become a height.
        className="min-w-0 flex-none basis-auto"
      />
      {allRow && !isSearching ? (
        <button
          type="button"
          className={cn(
            ROW_CLASS,
            'flex-none',
            allRow.selected
              ? 'border-primary-highlight bg-hover-row'
              : 'border-transparent',
          )}
          aria-pressed={allRow.selected}
          onClick={allRow.onSelect}
        >
          <Layers className="text-text-secondary size-4 shrink-0" aria-hidden />
          <span
            className={cn(
              'text-text-primary min-w-0 truncate',
              allRow.selected ? 'text-h5' : 'text-b2',
            )}
          >
            {t('categories.tree.all')}
          </span>
          {allRow.count !== null ? (
            <span className="text-b3 text-text-muted ms-auto tabular-nums">
              <span aria-hidden>{allRow.count}</span>
              <span className="sr-only">
                {t('categories.tree.itemCount', { count: allRow.count })}
              </span>
            </span>
          ) : null}
        </button>
      ) : null}
      {nodes.length === 0 && isSearching ? (
        <p className="text-b2 text-text-secondary">
          {t('categories.tree.noMatch')}
        </p>
      ) : (
        <TreeList
          nodes={nodes}
          selectedId={selectedId}
          collapsedIds={effectiveCollapsed}
          onToggle={handleToggle}
          onSelect={onSelect}
          toggleDisabled={isSearching}
          getNodeActions={getNodeActions}
        />
      )}
    </div>
  );
}
