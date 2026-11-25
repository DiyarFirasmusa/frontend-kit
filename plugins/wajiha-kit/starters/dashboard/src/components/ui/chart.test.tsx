import { describe, expect, it } from 'vitest';
import { setTestLanguage } from '@/test/i18n';
import { renderWithProviders } from '@/test/render';
import {
  ChartContainer,
  ChartStyle,
  formatChartValue,
  type ChartConfig,
  chartSeriesColor,
} from './chart';

describe('chartSeriesColor', () => {
  it('returns the design series tokens in order', () => {
    expect(chartSeriesColor(0)).toBe('var(--chart-1)');
    expect(chartSeriesColor(4)).toBe('var(--chart-5)');
  });

  it('wraps after five series and handles negative indexes', () => {
    expect(chartSeriesColor(5)).toBe('var(--chart-1)');
    expect(chartSeriesColor(-1)).toBe('var(--chart-5)');
  });
});

describe('ChartContainer', () => {
  it('exposes config colours as scoped CSS variables', () => {
    const config = {
      sales: { label: 'Sales', color: '#B86A7E' },
    } satisfies ChartConfig;
    const { container } = renderWithProviders(
      <ChartContainer config={config} id="sales-chart">
        <div />
      </ChartContainer>,
    );
    const root = container.querySelector('[data-slot="chart"]');
    expect(root).toHaveAttribute('data-chart', 'chart-sales-chart');
    expect(container.querySelector('style')?.innerHTML).toContain(
      '--color-sales: #B86A7E;',
    );
  });
});

describe('ChartContainer rendering', () => {
  it('mounts the Recharts responsive container without waiting for a size gate', () => {
    const { container } = renderWithProviders(
      <ChartContainer config={{}}>
        <div />
      </ChartContainer>,
    );
    expect(
      container.querySelector('.recharts-responsive-container'),
    ).toBeInTheDocument();
  });

  it('drops colour values that could break out of the stylesheet', () => {
    const config = {
      sales: { label: 'Sales', color: 'red} body { display: none' },
    } satisfies ChartConfig;
    const { container } = renderWithProviders(
      <ChartContainer config={config} id="unsafe-chart">
        <div />
      </ChartContainer>,
    );
    const css = container.querySelector('style')?.innerHTML ?? '';
    expect(css).not.toContain('--color-sales');
    expect(css).not.toContain('display: none');
  });
});

describe('ChartStyle', () => {
  it('does not let a crafted id break out of the stylesheet', () => {
    const { container } = renderWithProviders(
      <ChartStyle
        id="</style><b>x"
        config={{ sales: { label: 'Sales', color: '#B86A7E' } }}
      />,
    );
    const css = container.querySelector('style')?.innerHTML ?? '';
    expect(css).not.toContain('<b>');
    expect(css).not.toContain('</style>');
    expect(css).toContain('[data-chart=stylebx]');
  });
});

describe('formatChartValue', () => {
  it('formats with Western digits in English', () => {
    expect(formatChartValue(12345)).toBe('12,345');
  });

  it('keeps Western digits when Arabic is active', async () => {
    await setTestLanguage('ar');
    expect(formatChartValue(12345)).toBe('12,345');
  });

  it('renders a non-numeric value as the em dash, never NaN', () => {
    expect(formatChartValue('not-a-number')).toBe('—');
    expect(formatChartValue('')).toBe('—');
  });
});

describe('ChartStyle default colours', () => {
  it('assigns the design series palette to entries without a colour', () => {
    const { container } = renderWithProviders(
      <ChartContainer
        config={{ first: { label: 'First' }, second: { label: 'Second' } }}
      >
        <div />
      </ChartContainer>,
    );
    const css = container.querySelector('style')?.innerHTML ?? '';
    expect(css).toContain('--color-first: var(--chart-1);');
    expect(css).toContain('--color-second: var(--chart-2);');
  });
});
