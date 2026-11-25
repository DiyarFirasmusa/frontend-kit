import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, type IconComponent } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  changeDirection,
  changeTone,
  formatChangePercent,
  formatKpiValue,
  type HomeChangeTone,
} from '../hooks/home-actions';
import type { HomeLink, KpiCard } from '../types/types';
import { HomeKpiVisual, type HomeKpiVisualKind } from './home-kpi-visual';

export type HomeKpiTone = 'warning' | 'neutral';
export type HomeKpiAccent = 'brand' | 'warning';

const CHANGE_CLASS: Record<HomeChangeTone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  neutral: 'text-text-secondary',
};

const VALUE_CLASS: Record<HomeKpiTone, string> = {
  warning: 'text-warning',
  neutral: 'text-text-primary',
};

const ACCENT_CLASS: Record<HomeKpiAccent, string> = {
  brand: 'border-s-2 border-s-primary-highlight shadow-primary',
  warning: 'border-s-2 border-s-warning',
};

export interface HomeKpiCardProps {
  index: number;
  label: string;
  icon: IconComponent;
  card: KpiCard | null;
  link: HomeLink;
  visual: HomeKpiVisualKind;
  tone?: HomeKpiTone;
  accent?: HomeKpiAccent;
  tintedIcon?: boolean;
}

export function HomeKpiCard({
  index,
  label,
  icon: Icon,
  card,
  link,
  visual,
  tone = 'neutral',
  accent,
  tintedIcon = false,
}: HomeKpiCardProps) {
  const { t } = useTranslation();
  const changePercent = card?.changePercent ?? null;
  const direction = changeDirection(changePercent);
  const Arrow = direction === 'down' ? ArrowDown : ArrowUp;

  return (
    <Link
      {...link}
      className={cn(
        'bg-surface border-stroke rounded-kpi gap-row px-panel py-row hover:bg-hover-row relative flex min-h-22 items-center justify-between border transition-colors',
        accent ? ACCENT_CLASS[accent] : undefined,
      )}
    >
      <span
        aria-hidden="true"
        data-index={String(index).padStart(2, '0')}
        className="text-stroke-strong absolute end-3.5 top-2.5 font-mono text-[10px] leading-none before:content-[attr(data-index)]"
      />
      <div className="gap-inline flex min-w-0 items-center">
        <span
          className={cn(
            'border-stroke rounded-control grid size-10 shrink-0 place-items-center border',
            tintedIcon ? 'bg-primary-light' : undefined,
            tone === 'warning' ? 'text-warning' : 'text-text-primary',
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className={cn('text-kpi tabular-nums', VALUE_CLASS[tone])}>
            {formatKpiValue(card?.value)}
          </span>
          <span className="text-h5 text-text-primary truncate">{label}</span>
        </div>
      </div>
      <div className="gap-row flex shrink-0 items-center pt-2">
        {changePercent !== null ? (
          <span dir="ltr" className="inline-flex items-center">
            <span
              className={cn(
                'text-label inline-flex items-center gap-0.5 tabular-nums',
                CHANGE_CLASS[changeTone(changePercent)],
              )}
            >
              {direction !== null ? (
                <Arrow className="size-3.5" aria-hidden="true" />
              ) : null}
              {formatChangePercent(changePercent)}
            </span>
            {direction !== null ? (
              <span className="sr-only">
                {direction === 'up'
                  ? t('common.increase')
                  : t('common.decrease')}
              </span>
            ) : null}
          </span>
        ) : null}
        <HomeKpiVisual
          kind={visual}
          trend={card?.trend ?? null}
          value={card?.value ?? null}
        />
      </div>
    </Link>
  );
}
