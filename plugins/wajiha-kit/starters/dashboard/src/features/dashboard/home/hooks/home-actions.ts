import type { HomeWidgetState } from '../types/types';

export type HomeGreetingKey =
  | 'greeting.morning'
  | 'greeting.morningPlain'
  | 'greeting.evening'
  | 'greeting.eveningPlain';

export type HomeChangeTone = 'success' | 'danger' | 'neutral';

export function greetingKey(hour: number, hasName: boolean): HomeGreetingKey {
  if (hour < 12) {
    return hasName ? 'greeting.morning' : 'greeting.morningPlain';
  }
  return hasName ? 'greeting.evening' : 'greeting.eveningPlain';
}

export function changeTone(
  changePercent: number | null | undefined,
): HomeChangeTone {
  if (changePercent !== null && changePercent !== undefined) {
    if (changePercent > 0) {
      return 'success';
    }
    if (changePercent < 0) {
      return 'danger';
    }
  }
  return 'neutral';
}

export function changeDirection(
  changePercent: number | null | undefined,
): 'up' | 'down' | null {
  if (changePercent !== null && changePercent !== undefined) {
    if (changePercent > 0) {
      return 'up';
    }
    if (changePercent < 0) {
      return 'down';
    }
  }
  return null;
}

export function formatChangePercent(
  changePercent: number | null | undefined,
): string {
  if (changePercent === null || changePercent === undefined) {
    return '—';
  }
  return `${Math.abs(changePercent).toFixed(0)}%`;
}

/** "+12.4%" / "-3%": signed, one decimal only when needed. */
export function formatSignedPercent(
  changePercent: number | null | undefined,
): string {
  if (changePercent === null || changePercent === undefined) {
    return '—';
  }
  const rounded = Math.round(changePercent * 10) / 10;
  const sign = rounded > 0 ? '+' : rounded < 0 ? '-' : '';
  return `${sign}${Math.abs(rounded)}%`;
}

export function sparklinePoints(
  trend: number[] | null | undefined,
  width: number,
  height: number,
): string {
  if (!trend || trend.length === 0) {
    return '';
  }
  if (trend.length === 1) {
    const mid = (height / 2).toFixed(1);
    return `0.0,${mid} ${width.toFixed(1)},${mid}`;
  }

  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const spread = max - min;
  const step = width / (trend.length - 1);

  return trend
    .map((value, index) => {
      const x = (index * step).toFixed(1);
      const y =
        spread === 0 ? height / 2 : height - ((value - min) / spread) * height;
      return `${x},${y.toFixed(1)}`;
    })
    .join(' ');
}

/** KPI value with Western digits and grouping; no zero padding (it read as an index). */
export function formatKpiValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return new Intl.NumberFormat('en-US').format(value);
}

/** Heights (0..height) for the last `count` trend values, scaled to the largest. */
export function barHeights(
  trend: number[] | null | undefined,
  count: number,
  height: number,
): number[] {
  const values = (trend ?? []).slice(-count);
  const max = Math.max(0, ...values);
  return values.map((value) =>
    max === 0 ? 0 : (Math.max(0, value) / max) * height,
  );
}

/** Ring fill (0..1): the current value against the largest value in its trend. */
export function ringRatio(
  value: number | null | undefined,
  trend: number[] | null | undefined,
): number {
  if (value === null || value === undefined || value <= 0) {
    return 0;
  }
  const max = Math.max(value, ...(trend ?? []));
  return Math.min(1, value / max);
}

export function toWidgetState<T>(query: {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}): HomeWidgetState<T> {
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    onRetry: () => {
      void query.refetch();
    },
  };
}
