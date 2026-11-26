import type { IconComponent } from '@/components/ui/icons';
import { cn } from '@/shared/utils/cn';

type Tone = 'neutral' | 'success' | 'warning';

const TONES: Record<Tone, string> = {
  neutral: 'bg-primary-light text-primary-text',
  success: 'bg-tag-green-container text-tag-green',
  warning: 'bg-tag-yellow-container text-tag-yellow',
};

/** One number with its label and an icon tile. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  icon: IconComponent;
  tone?: Tone;
}) {
  return (
    <div className="card p-card gap-inline flex items-center">
      <span className={cn('rounded-kpi grid size-12 shrink-0 place-items-center', TONES[tone])}>
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-b2 text-text-secondary">{label}</span>
        <span className="text-kpi text-text-primary tabular-nums">{value}</span>
      </div>
    </div>
  );
}
