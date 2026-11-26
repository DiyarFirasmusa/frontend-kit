import { useTranslation } from 'react-i18next';
import { SearchField } from '@/components/filters/search-field';
import { ListFilterSelect } from '@/components/table/list-filter-select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from '@/lib/icons';
import {
  toUomDecimalsFilter,
  toUomStatusFilter,
  useUnitOfMeasureFilters,
} from '../hooks/filter/use-uom-filters';
import { UOM_DECIMALS } from '../types/types';

export function UnitOfMeasureFilterBar() {
  const { t } = useTranslation();
  const filters = useUnitOfMeasureFilters();
  const { search } = filters;

  return (
    <search
      aria-label={t('unitsOfMeasure.filters.label')}
      className="gap-field flex flex-wrap items-center"
    >
      <SearchField
        value={search.q}
        onCommit={(q) => {
          filters.setFilters({ q });
        }}
        placeholder={t('unitsOfMeasure.filters.searchPlaceholder')}
      />
      <ListFilterSelect
        id="filter-status"
        label={t('unitsOfMeasure.filters.status')}
        value={search.status === 'all' ? '' : search.status}
        options={[
          { value: 'active', label: t('common.active') },
          { value: 'inactive', label: t('common.inactive') },
        ]}
        onChange={(value) => {
          filters.setFilters({ status: toUomStatusFilter(value) });
        }}
      />
      <ListFilterSelect
        id="filter-decimals"
        label={t('unitsOfMeasure.filters.decimals')}
        value={search.decimals === 'all' ? '' : search.decimals}
        options={UOM_DECIMALS.filter((value) => value !== 'all').map(
          (value) => ({ value, label: value }),
        )}
        onChange={(value) => {
          filters.setFilters({ decimals: toUomDecimalsFilter(value) });
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
