import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import {
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart-tooltip';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import {
  changeTone,
  formatSignedPercent,
  type HomeChangeTone,
} from '../hooks/home-actions';
import type {
  ActivityDay,
  ActivityTrend,
  HomeWidgetState,
} from '../types/types';
import { niceTicks, pickTickIndexes } from '../utils/chart-scale';
import { formatShortDate } from '../utils/relative-time';
import { HomePanelFrame } from './home-panel-frame';

export interface HomeActivityChartProps {
  state: HomeWidgetState<ActivityTrend>;
  days: number;
}

interface ChartPoint {
  date: string;
  created: number;
  updated: number;
}

const CHANGE_CLASS: Record<HomeChangeTone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  neutral: 'text-text-secondary',
};

const X_TICK_COUNT = 6;
const Y_TICK_COUNT = 4;

export function toChartPoints(days: ActivityDay[]): ChartPoint[] {
  return days.map((day) => ({
    date: day.date ?? '',
    created: day.created,
    updated: day.updated,
  }));
}

function Legend({ activity }: { activity: ActivityTrend }) {
  const { t } = useTranslation();
  return (
    <dl className="gap-row flex flex-wrap items-center">
      <div className="gap-field flex items-center">
        <span aria-hidden className="bg-chart-1 size-2 rounded-full" />
        <dt className="text-b3 text-text-secondary">
          {t('home.activity.created')}
        </dt>
        <dd className="text-label text-text-primary tabular-nums">
          {formatNumber(activity.created)}
        </dd>
      </div>
      <div className="gap-field flex items-center">
        <span aria-hidden className="bg-chart-4 size-2 rounded-full" />
        <dt className="text-b3 text-text-secondary">
          {t('home.activity.updated')}
        </dt>
        <dd className="text-label text-text-primary tabular-nums">
          {formatNumber(activity.updated)}
        </dd>
      </div>
      <div className="flex items-center">
        <dt className="sr-only">{t('home.kpi.change')}</dt>
        <dd
          className={cn(
            'text-b3 tabular-nums',
            CHANGE_CLASS[changeTone(activity.changePercent)],
          )}
        >
          {formatSignedPercent(activity.changePercent)}
        </dd>
      </div>
    </dl>
  );
}

function ActivityAreaChart({ activity }: { activity: ActivityTrend }) {
  const { t, i18n } = useTranslation();
  const gradientId = useId().replaceAll(/[^a-zA-Z0-9]/gu, '');
  const points = toChartPoints(activity.days ?? []);
  const max = Math.max(0, ...points.flatMap((p) => [p.created, p.updated]));
  const yTicks = niceTicks(max, Y_TICK_COUNT);
  const xTicks = pickTickIndexes(points.length, X_TICK_COUNT).map(
    (index) => points[index]?.date ?? '',
  );
  const shortDate = (value: unknown) =>
    formatShortDate(String(value), i18n.language);

  const config: ChartConfig = {
    created: { label: t('home.activity.created'), color: 'var(--chart-1)' },
    updated: { label: t('home.activity.updated'), color: 'var(--chart-4)' },
  };

  return (
    <ChartContainer
      config={config}
      role="img"
      aria-label={t('home.activity.title')}
      className="h-52 w-full"
    >
      <AreaChart
        data={points}
        margin={{ top: 8, right: 0, bottom: 0, left: 24 }}
      >
        <defs>
          <linearGradient id={`${gradientId}a`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-created)"
              stopOpacity={0.22}
            />
            <stop
              offset="100%"
              stopColor="var(--color-created)"
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id={`${gradientId}b`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-updated)"
              stopOpacity={0.14}
            />
            <stop
              offset="100%"
              stopColor="var(--color-updated)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          ticks={xTicks}
          interval={0}
          tickFormatter={shortDate}
          tickLine={false}
          axisLine={false}
          tickMargin={12}
        />
        <YAxis
          orientation="right"
          ticks={yTicks}
          domain={[0, yTicks.at(-1) ?? 'auto']}
          tickFormatter={(value: number) => formatNumber(value)}
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          width={56}
        />
        <ChartTooltip
          content={<ChartTooltipContent labelFormatter={shortDate} />}
        />
        <Area
          type="monotone"
          dataKey="created"
          stroke="var(--color-created)"
          strokeWidth={2}
          fill={`url(#${gradientId}a)`}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="updated"
          stroke="var(--color-updated)"
          strokeWidth={2}
          strokeDasharray="6 4"
          fill={`url(#${gradientId}b)`}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function HomeActivityChart({ state, days }: HomeActivityChartProps) {
  const { t } = useTranslation();

  return (
    <HomePanelFrame
      title={t('home.activity.title')}
      subtitle={t('home.activity.subtitle', { days })}
      layoutDir="ltr"
      aside={state.data ? <Legend activity={state.data} /> : null}
    >
      <Wrapper
        isLoading={state.isLoading}
        isError={state.isError}
        error={state.error}
        data={state.data}
        isEmpty={(activity) => !activity.days || activity.days.length === 0}
        emptyMessage={t('home.activity.empty')}
        errorMessage={t('home.loadError')}
        onRetry={state.onRetry}
      >
        {(activity) => <ActivityAreaChart activity={activity} />}
      </Wrapper>
    </HomePanelFrame>
  );
}
