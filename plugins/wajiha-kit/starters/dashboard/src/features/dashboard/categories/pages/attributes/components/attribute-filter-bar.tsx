import { useTranslation } from 'react-i18next';
import { SearchField } from '@/components/filters/search-field';
import { ListFilterSelect } from '@/components/table/list-filter-select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from '@/lib/icons';
import { AttributeDataTypeValues } from '@/types/api/enums';
import {
  toAttributeStatusFilter,
  toAttributeTypeFilter,
  useAttributeFilters,
} from '../hooks/filter/use-attribute-filters';

export function AttributeFilterBar() {
  const { t } = useTranslation();
  const filters = useAttributeFilters();
  const { search } = filters;

  return (
    <search
      aria-label={t('categories.attributes.filters.label')}
      className="gap-field flex flex-wrap items-center"
    >
      <SearchField
        value={search.q}
        onCommit={(q) => {
          filters.setFilters({ q });
        }}
        placeholder={t('categories.attributes.filters.searchPlaceholder')}
      />
      <ListFilterSelect
        id="filter-data-type"
        label={t('categories.attributes.filters.dataType')}
        value={search.dataType === 'all' ? '' : search.dataType}
        options={AttributeDataTypeValues.map((value) => ({
          value,
          label: t(`enums.AttributeDataType.${value}`),
        }))}
        onChange={(value) => {
          filters.setFilters({ dataType: toAttributeTypeFilter(value) });
        }}
      />
      <ListFilterSelect
        id="filter-status"
        label={t('categories.attributes.filters.status')}
        value={search.status === 'all' ? '' : search.status}
        options={[
          { value: 'active', label: t('common.active') },
          { value: 'inactive', label: t('common.inactive') },
        ]}
        onChange={(value) => {
          filters.setFilters({ status: toAttributeStatusFilter(value) });
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
