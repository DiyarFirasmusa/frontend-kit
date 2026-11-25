import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { HomeKpiVisual } from './home-kpi-visual';

describe('HomeKpiVisual', () => {
  it('draws a decorative sparkline with an area fill', () => {
    const { container } = renderWithProviders(
      <HomeKpiVisual kind="line" trend={[1, 3, 2, 5]} value={5} />,
    );
    const svg = container.querySelector('svg[data-kind="line"]');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.querySelector('polyline')).not.toBeNull();
    expect(svg?.querySelector('polygon')).not.toBeNull();
  });

  it('draws the last five values as bars and highlights the last one', () => {
    const { container } = renderWithProviders(
      <HomeKpiVisual kind="bars" trend={[1, 2, 3, 4, 5, 6, 7]} value={7} />,
    );
    const bars = container.querySelectorAll('rect');
    expect(bars).toHaveLength(5);
    expect(bars[4]).toHaveClass('fill-warning');
    expect(bars[0]).not.toHaveClass('fill-warning');
  });

  it('fills the ring by the value against the trend peak', () => {
    const { container } = renderWithProviders(
      <HomeKpiVisual kind="ring" trend={[20, 10]} value={10} />,
    );
    const [, progress] = container.querySelectorAll('circle');
    const circumference = 2 * Math.PI * 10;
    expect(Number(progress.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      circumference / 2,
    );
  });

  it('renders nothing for a line or bars without a trend', () => {
    const line = renderWithProviders(
      <HomeKpiVisual kind="line" trend={null} value={null} />,
    );
    expect(line.container.querySelector('svg')).toBeNull();
    const bars = renderWithProviders(
      <HomeKpiVisual kind="bars" trend={[]} value={null} />,
    );
    expect(bars.container.querySelector('svg')).toBeNull();
  });
});
