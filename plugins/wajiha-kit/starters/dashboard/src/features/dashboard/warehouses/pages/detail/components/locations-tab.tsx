import { useTranslation } from 'react-i18next';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { useLocationsTab } from '../hooks/use-locations-tab';
import { LocationTree } from './location-tree';

interface LocationsTabProps {
  warehouseId: string;
}

export function LocationsTab({ warehouseId }: LocationsTabProps) {
  const { t } = useTranslation();
  const { query, tree, total, zoneCount } = useLocationsTab(warehouseId);

  return (
    <section
      aria-labelledby="warehouse-locations-title"
      className="surface-card gap-card flex flex-col"
    >
      <div className="gap-row flex flex-wrap items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2
            id="warehouse-locations-title"
            className="text-h4 text-text-primary"
          >
            {t('warehouses.locations.title')}
          </h2>
          {total > 0 ? (
            <p className="text-b3 text-text-secondary tabular-nums">
              {t('warehouses.locations.summary', {
                count: total,
                zones: zoneCount,
              })}
            </p>
          ) : null}
        </div>
      </div>
      <Wrapper
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        data={query.data}
        isEmpty={(locations) => locations.length === 0}
        emptyMessage={t('warehouses.locations.empty')}
        onRetry={() => {
          void query.refetch();
        }}
      >
        {() => <LocationTree nodes={tree} />}
      </Wrapper>
    </section>
  );
}
