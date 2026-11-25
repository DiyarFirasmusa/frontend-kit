import * as React from 'react';
import { Legend as RechartsLegend } from 'recharts';
import { cn } from '@/lib/utils';
import { useChart } from './chart';
import { getPayloadConfigFromPayload } from './chart-payload';

const ChartLegend = RechartsLegend;

type LegendItem = {
  value?: React.ReactNode;
  dataKey?: string | number;
  color?: string;
};

interface ChartLegendContentProps {
  className?: string;
  hideIcon?: boolean;
  payload?: LegendItem[];
  verticalAlign?: 'top' | 'middle' | 'bottom';
  nameKey?: string;
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={String(item.value ?? index)}
            className={cn(
              'flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-(--text-muted)',
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              // Inline colour is intentional: the series colour is only known at runtime from recharts.
              <div
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

export { ChartLegend, ChartLegendContent };
