import { useTranslation } from 'react-i18next';
import { SearchField } from '@/components/filters/search-field';
import { ListFilterSelect } from '@/components/table/list-filter-select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from '@/lib/icons';
import {
  toSupplierStatusFilter,
  useSupplierFilters,
} from '../hooks/filter/use-supplier-filters';

export function SupplierFilterBar() {
  const { t } = useTranslation();
  const filters = useSupplierFilters();

  return (
    <search
      aria-label={t('suppliers.filters.label')}
      className="gap-field flex flex-wrap items-center"
    >
      <SearchField
        value={filters.values.q}
        onCommit={(q) => {
          filters.setFilters({ q });
        }}
        placeholder={t('suppliers.filters.searchPlaceholder')}
      />
      <ListFilterSelect
        id="filter-status"
        label={t('suppliers.filters.status')}
        value={filters.values.status === 'all' ? '' : filters.values.status}
        options={[
          { value: 'active', label: t('common.active') },
          { value: 'inactive', label: t('common.inactive') },
        ]}
        onChange={(value) => {
          filters.setFilters({ status: toSupplierStatusFilter(value) });
        }}
      />
      {filters.activeCount > 0 ? (
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
