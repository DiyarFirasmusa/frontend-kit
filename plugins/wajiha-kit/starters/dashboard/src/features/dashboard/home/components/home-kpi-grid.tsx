import { useTranslation } from 'react-i18next';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { Building2, Hash, Tag, Warehouse } from '@/lib/icons';
import type { HomeAccess } from '../hooks/home-access';
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
  /** A card of a kind the user may not read is not rendered. */
  access: HomeAccess;
}

export function HomeKpiGrid({ state, access }: HomeKpiGridProps) {
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
        /* Columns follow the space the grid gets, not the viewport: with the
           sidebar open an 800px window leaves too little for two cards. */
        <div className="@container">
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 @2xl:grid-cols-2 @6xl:grid-cols-4">
            {access.warehouse ? (
              <HomeKpiCard
                label={t('home.kpi.warehouses')}
                icon={Warehouse}
                card={summary.warehouses}
                link={{ to: '/warehouses' }}
                visual="line"
              />
            ) : null}
            {access.supplier ? (
              <HomeKpiCard
                label={t('home.kpi.suppliers')}
                icon={Building2}
                card={summary.suppliers}
                link={{ to: '/suppliers' }}
                visual="bars"
              />
            ) : null}
            {access.category ? (
              <HomeKpiCard
                label={t('home.kpi.categories')}
                icon={Tag}
                card={summary.categories}
                link={{ to: '/categories' }}
                visual="ring"
              />
            ) : null}
            {access.unit ? (
              <HomeKpiCard
                label={t('home.kpi.units')}
                icon={Hash}
                card={summary.units}
                link={{ to: '/units-of-measure' }}
                visual="ring"
              />
            ) : null}
          </div>
        </div>
      )}
    </Wrapper>
  );
}
