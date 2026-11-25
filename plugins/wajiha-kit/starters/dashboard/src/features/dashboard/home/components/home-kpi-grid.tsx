import { useTranslation } from 'react-i18next';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { Building2, Hash, Tag, Warehouse } from '@/lib/icons';
import type { HomeWidgetState, OverviewSummary } from '../types/types';
import { HomeKpiCard } from './home-kpi-card';

const EMPTY_SUMMARY: OverviewSummary = {
  generatedAt: null,
  warehouses: null,
  suppliers: null,
  categories: null,
  units: null,
};

export interface HomeKpiGridProps {
  state: HomeWidgetState<OverviewSummary>;
}

export function HomeKpiGrid({ state }: HomeKpiGridProps) {
  const { t } = useTranslation();

  return (
    <Wrapper
      isLoading={state.isLoading}
      isError={state.isError}
      error={state.error}
      data={state.data ?? EMPTY_SUMMARY}
      isEmpty={() => false}
      errorMessage={t('home.loadError')}
      onRetry={state.onRetry}
    >
      {(summary) => (
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 2xl:grid-cols-4">
          <HomeKpiCard
            index={1}
            label={t('home.kpi.warehouses')}
            icon={Warehouse}
            card={summary.warehouses}
            link={{ to: '/warehouses' }}
            visual="line"
            accent="brand"
          />
          <HomeKpiCard
            index={2}
            label={t('home.kpi.suppliers')}
            icon={Building2}
            card={summary.suppliers}
            link={{ to: '/suppliers' }}
            visual="bars"
          />
          <HomeKpiCard
            index={3}
            label={t('home.kpi.categories')}
            icon={Tag}
            card={summary.categories}
            link={{ to: '/categories' }}
            visual="ring"
          />
          <HomeKpiCard
            index={4}
            label={t('home.kpi.units')}
            icon={Hash}
            card={summary.units}
            link={{ to: '/units-of-measure' }}
            visual="ring"
          />
        </div>
      )}
    </Wrapper>
  );
}
