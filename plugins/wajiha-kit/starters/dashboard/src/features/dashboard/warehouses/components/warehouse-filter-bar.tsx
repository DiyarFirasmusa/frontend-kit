import { useTranslation } from 'react-i18next';
import { SearchField } from '@/components/filters/search-field';
import { ListFilterSelect } from '@/components/table/list-filter-select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from '@/lib/icons';
import {
  toWarehouseStatusFilter,
  toWarehouseTypeFilter,
  useWarehouseFilters,
} from '../hooks/filter/use-warehouse-filters';

export function WarehouseFilterBar() {
  const { t } = useTranslation();
  const filters = useWarehouseFilters();
  const { search } = filters;

  return (
    <search
      aria-label={t('warehouses.filters.label')}
      className="gap-field flex flex-wrap items-center"
    >
      <SearchField
        value={search.q}
        onCommit={(q) => {
          filters.setFilters({ q });
        }}
        placeholder={t('warehouses.filters.searchPlaceholder')}
      />
      <ListFilterSelect
        id="filter-status"
        label={t('warehouses.filters.status')}
        value={search.status === 'all' ? '' : search.status}
        options={[
          { value: 'active', label: t('common.active') },
          { value: 'inactive', label: t('common.inactive') },
        ]}
        onChange={(value) => {
          filters.setFilters({ status: toWarehouseStatusFilter(value) });
        }}
      />
      <ListFilterSelect
        id="filter-type"
        label={t('warehouses.filters.type')}
        value={search.type === 'all' ? '' : search.type}
        options={[
          { value: 'regular', label: t('warehouses.type.regular') },
          { value: 'transit', label: t('warehouses.type.transit') },
        ]}
        onChange={(value) => {
          filters.setFilters({ type: toWarehouseTypeFilter(value) });
        }}
      />
      {filters.hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          className="text-text-secondary h-10 gap-2 px-2"
          onClick={filters.clear}
        >
          <RefreshCw className="size-4" />
          {t('table.clearFilters')}
        </Button>
      ) : null}
    </search>
  );
}
