import * as React from 'react';
import { ResponsiveContainer as RechartsResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const THEMES = { light: '', dark: '.dark' } as const;

/** Western digits and grouping in both languages, independent of the browser locale. */
const CHART_NUMBER_FORMAT = new Intl.NumberFormat('en-US');

/** Non-numeric or empty values render as the em dash, the repo-wide empty display value. */
export function formatChartValue(value: number | string): string {
  if (typeof value === 'string' && value.trim() === '') {
    return '—';
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? CHART_NUMBER_FORMAT.format(numeric) : '—';
}

/** Series colours in design order (--chart-1 .. --chart-5), as CSS vars. */
export const CHART_SERIES_COUNT = 5;

export function chartSeriesColor(index: number): string {
  const slot =
    ((index % CHART_SERIES_COUNT) + CHART_SERIES_COUNT) % CHART_SERIES_COUNT;
  return `var(--chart-${slot + 1})`;
}

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

type ChartContextProps = { config: ChartConfig };

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

/** Keeps ids and config keys to a CSS-safe alphabet before they reach selectors or the stylesheet. */
function sanitizeChartToken(value: string): string {
  return value.replaceAll(/[^a-zA-Z0-9_-]/g, '');
}

/** Only plain colour values (hex, rgb(a), hsl(a), var(--token) or a named colour) may reach the stylesheet. */
const SAFE_COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla)\([0-9\s.,%+-]+\)|var\(--[a-zA-Z0-9_-]+\)|[a-zA-Z]{3,20})$/;

function sanitizeChartColor(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  return SAFE_COLOR_PATTERN.test(value) ? value : undefined;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsResponsiveContainer
  >['children'];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ? sanitizeChartToken(id) : sanitizeChartToken(uniqueId)}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-b3 [&_.recharts-cartesian-axis-tick_text]:fill-(--text-muted) [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-(--stroke-subtle) [&_.recharts-curve.recharts-tooltip-cursor]:stroke-(--stroke-strong) [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-(--stroke-subtle) [&_.recharts-radial-bar-background-sector]:fill-(--hover-row) [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--hover-row) [&_.recharts-reference-line_[stroke='#ccc']]:stroke-(--stroke-subtle) [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const safeId = sanitizeChartToken(id);
  // Entries without any colour fall back to the design series palette in config order.
  const colorConfig = Object.entries(config)
    .map(
      ([key, itemConfig], index) =>
        [sanitizeChartToken(key), itemConfig, index] as const,
    )
    .filter(([key]) => key !== '');

  if (colorConfig.length === 0) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${safeId}] {
${colorConfig
  .map(([key, itemConfig, index]) => {
    const configured =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    const color =
      configured === undefined
        ? chartSeriesColor(index)
        : sanitizeChartColor(configured);
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  );
};

export { ChartContainer, ChartStyle };
