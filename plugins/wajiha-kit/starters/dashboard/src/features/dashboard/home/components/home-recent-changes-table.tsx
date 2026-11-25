import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { BadgeTone } from '@/components/table/data-badge';
import { buttonVariants } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { MoreHorizontal } from '@/lib/icons';
import type {
  ChangeAction,
  ChangeResource,
  HomeLink,
  HomeWidgetState,
  RecentChange,
} from '../types/types';
import { formatDayTime } from '../utils/relative-time';
import { HomePanelFrame } from './home-panel-frame';
import { HomeStatusDot } from './home-status-dot';

export interface HomeRecentChangesTableProps {
  state: HomeWidgetState<RecentChange[]>;
}

const HEAD_CLASS =
  'text-table-header text-text-muted h-9 px-row text-start font-normal whitespace-nowrap first:rounded-s-lg last:rounded-e-lg';
const CELL_CLASS =
  'text-b3 text-text-primary px-row align-middle whitespace-nowrap';

const ACTION_TONE: Record<ChangeAction, BadgeTone> = {
  created: 'success',
  updated: 'info',
  deleted: 'danger',
};

/** The list page that owns each kind of record. */
export const RESOURCE_LINK: Record<ChangeResource, HomeLink> = {
  warehouse: { to: '/warehouses' },
  supplier: { to: '/suppliers' },
  category: { to: '/categories' },
  unit: { to: '/units-of-measure' },
};

function ChangeRow({ row }: { row: RecentChange }) {
  const { t, i18n } = useTranslation();
  const resource = t(`home.recent.resource.${row.resource}`);
  return (
    <tr className="border-stroke-subtle hover:bg-hover-row h-[46px] border-b transition-colors last:border-b-0">
      <td className={CELL_CLASS}>
        <span className="text-label">{row.name || '—'}</span>
      </td>
      <td className={CELL_CLASS}>{resource}</td>
      <td className={CELL_CLASS}>
        <HomeStatusDot
          tone={ACTION_TONE[row.action]}
          label={t(`home.recent.action.${row.action}`)}
          tintLabel={false}
        />
      </td>
      <td className={`${CELL_CLASS} tabular-nums`}>
        {formatDayTime(row.at, { t, language: i18n.language })}
      </td>
      <td className={`${CELL_CLASS} text-end`}>
        <Link
          {...RESOURCE_LINK[row.resource]}
          aria-label={t('home.recent.open', { name: row.name, resource })}
          className={buttonVariants({ variant: 'ghost', size: 'icon-xs' })}
        >
          <MoreHorizontal className="size-4" aria-hidden />
        </Link>
      </td>
    </tr>
  );
}

export function HomeRecentChangesTable({ state }: HomeRecentChangesTableProps) {
  const { t } = useTranslation();

  return (
    <HomePanelFrame
      title={t('home.recent.title')}
      subtitle={t('home.recent.subtitle')}
    >
      <Wrapper
        isLoading={state.isLoading}
        isError={state.isError}
        error={state.error}
        data={state.data}
        isEmpty={(rows) => rows.length === 0}
        emptyMessage={t('home.recent.empty')}
        errorMessage={t('home.loadError')}
        onRetry={state.onRetry}
      >
        {(rows) => (
          <Table aria-label={t('home.recent.title')}>
            <thead>
              <tr className="bg-text-primary/5">
                <th className={HEAD_CLASS}>{t('home.recent.col.name')}</th>
                <th className={HEAD_CLASS}>{t('home.recent.col.resource')}</th>
                <th className={HEAD_CLASS}>{t('home.recent.col.action')}</th>
                <th className={HEAD_CLASS}>{t('home.recent.col.date')}</th>
                <th className={HEAD_CLASS}>
                  <span className="sr-only">
                    {t('home.recent.col.actions')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <ChangeRow key={row.id} row={row} />
              ))}
            </tbody>
          </Table>
        )}
      </Wrapper>
    </HomePanelFrame>
  );
}
