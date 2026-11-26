import { useId } from 'react';
import { cn } from '@/lib/utils';
import { barHeights, ringRatio, sparklinePoints } from '../hooks/home-actions';

export type HomeKpiVisualKind = 'line' | 'bars' | 'ring';

export interface HomeKpiVisualProps {
  kind: HomeKpiVisualKind;
  trend: number[] | null;
  value: number | null;
}

const LINE_WIDTH = 56;
const LINE_HEIGHT = 18;
const BAR_COUNT = 5;
const BAR_WIDTH = 6;
const BAR_GAP = 4;
const BAR_HEIGHT = 20;
const RING_RADIUS = 10;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function Sparkline({ trend }: { trend: number[] | null }) {
  const gradientId = `kpi-line-${useId().replaceAll(/[^a-zA-Z0-9]/g, '')}`;
  const points = sparklinePoints(trend, LINE_WIDTH, LINE_HEIGHT - 2);
  if (points === '') {
    return null;
  }
  const area = `0,${LINE_HEIGHT} ${points} ${LINE_WIDTH},${LINE_HEIGHT}`;
  return (
    <svg
      viewBox={`0 -1 ${LINE_WIDTH} ${LINE_HEIGHT + 1}`}
      aria-hidden="true"
      focusable="false"
      data-kind="line"
      className="h-5 w-14 shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.28} />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        strokeWidth={1.5}
        className="stroke-brand"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Bars({ trend }: { trend: number[] | null }) {
  const heights = barHeights(trend, BAR_COUNT, BAR_HEIGHT);
  if (heights.length === 0) {
    return null;
  }
  const width = heights.length * BAR_WIDTH + (heights.length - 1) * BAR_GAP;
  return (
    <svg
      viewBox={`0 0 ${width} ${BAR_HEIGHT}`}
      aria-hidden="true"
      focusable="false"
      data-kind="bars"
      className="h-5 w-11 shrink-0"
    >
      {heights.map((height, index) => {
        const barHeight = Math.max(4, height);
        return (
          <rect
            key={index}
            x={index * (BAR_WIDTH + BAR_GAP)}
            y={BAR_HEIGHT - barHeight}
            width={BAR_WIDTH}
            height={barHeight}
            rx={2}
            className={cn(
              index === heights.length - 1 ? 'fill-brand' : 'fill-brand/35',
            )}
          />
        );
      })}
    </svg>
  );
}

function Ring({
  value,
  trend,
}: {
  value: number | null;
  trend: number[] | null;
}) {
  const ratio = ringRatio(value, trend);
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-kind="ring"
      className="size-6 shrink-0 -rotate-90"
    >
      <circle
        cx={12}
        cy={12}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={2.5}
        className="stroke-stroke-strong"
      />
      <circle
        cx={12}
        cy={12}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={RING_CIRCUMFERENCE * (1 - ratio)}
        className="stroke-brand"
      />
    </svg>
  );
}

export function HomeKpiVisual({ kind, trend, value }: HomeKpiVisualProps) {
  if (kind === 'bars') {
    return <Bars trend={trend} />;
  }
  if (kind === 'ring') {
    return <Ring value={value} trend={trend} />;
  }
  return <Sparkline trend={trend} />;
}
