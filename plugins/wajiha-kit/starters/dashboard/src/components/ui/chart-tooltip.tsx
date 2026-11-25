import * as React from 'react';
import { Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { useChart, formatChartValue } from './chart';
import { getPayloadConfigFromPayload } from './chart-payload';

const ChartTooltip = RechartsTooltip;

type TooltipItem = {
  value?: number | string;
  name?: string | number;
  dataKey?: string | number;
  color?: string;
  payload?: { fill?: string } & Record<string, unknown>;
};

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: React.ReactNode;
  className?: string;
  indicator?: 'line' | 'dot' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelClassName?: string;
  labelFormatter?: (
    label: React.ReactNode,
    payload: TooltipItem[],
  ) => React.ReactNode;
  formatter?: (
    value: TooltipItem['value'],
    name: TooltipItem['name'],
    item: TooltipItem,
    index: number,
    payload: TooltipItem['payload'],
  ) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === 'string'
        ? (config[label]?.label ?? label)
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }
    return <div className={cn('font-medium', labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={cn(
        'border-(--stroke) bg-(--popover) grid min-w-[8rem] items-start gap-1.5 rounded-(--radius-nav) border px-2.5 py-1.5 text-b3 text-(--text-primary) shadow-mid',
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload?.fill || item.color;

          return (
            <div
              key={String(item.dataKey ?? index)}
              className={cn(
                'flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-(--text-muted)',
                indicator === 'dot' && 'items-center',
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      // Inline colour is intentional: the series colour is only known at runtime from recharts.
                      <div
                        className={cn(
                          'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
                          {
                            'h-2.5 w-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent':
                              indicator === 'dashed',
                            'my-0.5': nestLabel && indicator === 'dashed',
                          },
                        )}
                        style={
                          {
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      'flex flex-1 justify-between leading-none',
                      nestLabel ? 'items-end' : 'items-center',
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-(--text-muted)">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value !== null && item.value !== undefined && (
                      <span className="font-mono font-medium text-(--text-primary) tabular-nums">
                        {formatChartValue(item.value)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ChartTooltip, ChartTooltipContent };
