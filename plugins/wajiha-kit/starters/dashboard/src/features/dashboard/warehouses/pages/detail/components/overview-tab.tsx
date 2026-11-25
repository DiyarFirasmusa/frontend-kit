import { useTranslation } from 'react-i18next';
import { ReadOnlyField } from '@/components/fields/read-only-field';
import { ReadOnlySwitchRow } from '@/components/fields/read-only-switch-row';
import { Warehouse } from '@/lib/icons';
import type { WarehouseResponse } from '@/types/api/warehouses';
import { WarehouseManager } from '../../../components/warehouse-manager';

interface OverviewTabProps {
  warehouse: WarehouseResponse;
}

export function OverviewTab({ warehouse }: OverviewTabProps) {
  const { t } = useTranslation();
  const mapCount =
    warehouse.locationCount === null
      ? '—'
      : t('warehouses.overview.mapCount', { count: warehouse.locationCount });

  return (
    <section
      aria-label={t('warehouses.detail.tabs.overview')}
      className="surface-card gap-card grid lg:grid-cols-[320px_1fr]"
    >
      <MapTile title={t('warehouses.overview.map')} count={mapCount} />
      <div className="gap-x-row gap-y-card grid content-start sm:grid-cols-2">
        <ReadOnlyField
          label={t('warehouses.overview.code')}
          locked={t('warehouses.overview.codeLocked')}
          dir="ltr"
          value={warehouse.code}
        />
        <ReadOnlyField
          label={t('warehouses.overview.name')}
          value={warehouse.name}
        />
        <ReadOnlyField
          label={t('warehouses.col.address')}
          value={warehouse.address}
        />
        <ReadOnlyField
          label={t('warehouses.overview.manager')}
          value={<WarehouseManager warehouse={warehouse} />}
        />
        <ReadOnlySwitchRow
          label={t('warehouses.overview.isTransit')}
          checked={warehouse.isTransit === true}
        />
        <ReadOnlySwitchRow
          label={t('warehouses.overview.isActive')}
          checked={warehouse.isActive === true}
        />
      </div>
    </section>
  );
}

function MapTile({ title, count }: { title: string; count: string }) {
  return (
    <div className="border-stroke-strong bg-surface-elevated gap-field p-panel flex min-h-60 flex-col items-center justify-center rounded-(--radius-kpi) border border-dashed text-center">
      <Warehouse className="text-warning size-8" />
      <span className="text-b1 text-text-primary">{title}</span>
      <span className="text-b3 text-text-secondary tabular-nums">{count}</span>
    </div>
  );
}
