import type { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/utils/cn';

/* Semantic tones map onto the design system's tag palette (see badge.css).
   The raw palette names are accepted too, for cases that are decorative
   rather than status-bearing. */

/** Status-bearing tones — the vocabulary features theme against. */
export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand';

/** Raw tag colours, for decorative labels with no status meaning. */
export type BadgePalette = 'green' | 'red' | 'yellow' | 'orange' | 'cyan' | 'purple' | 'blue';

type BadgeShape = 'pill' | 'tag';
type BadgeSize = 'default' | 'sm';

interface VisualProps {
  shape?: BadgeShape;
  size?: BadgeSize;
  className?: string;
}

type CustomProps = VisualProps & {
  variant?: undefined;
  tone?: BadgeTone | BadgePalette;
  dot?: boolean;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
};

type StatusVariant = VisualProps & {
  variant: 'status';
  active: boolean;
};

export type DataBadgeProps = CustomProps | StatusVariant;

/* Status tones read their hue from the tag tokens. Neutral and brand keep
   their own text colour (secondary grey / burgundy text). A pill with a dot
   is a status badge and renders without a tint (`.badge-status`); chips
   without a dot and tag-shaped badges keep the 8-9% container. */
const TONE_CLASSES: Record<BadgeTone | BadgePalette, string> = {
  success: 'badge-green',
  danger: 'badge-red',
  warning: 'badge-orange',
  info: 'badge-blue',
  neutral: 'badge-neutral text-text-secondary',
  brand: 'badge-brand',
  green: 'badge-green',
  red: 'badge-red',
  yellow: 'badge-yellow',
  orange: 'badge-orange',
  cyan: 'badge-cyan',
  purple: 'badge-purple',
  blue: 'badge-blue',
};

interface Resolved {
  tone: BadgeTone | BadgePalette;
  shape: BadgeShape;
  dot: boolean;
  Icon?: ComponentType<{ className?: string }>;
  content: ReactNode;
}

function useResolved(props: DataBadgeProps): Resolved {
  const { t } = useTranslation();
  const shapeOr = (fallback: BadgeShape): BadgeShape => props.shape ?? fallback;

  if (props.variant === 'status') {
    return {
      tone: props.active ? 'success' : 'neutral',
      shape: shapeOr('pill'),
      dot: true,
      content: t(props.active ? 'ui.active' : 'ui.inactive'),
    };
  }

  return {
    tone: props.tone ?? 'neutral',
    shape: shapeOr('pill'),
    dot: props.dot ?? shapeOr('pill') === 'pill',
    Icon: props.icon,
    content: props.children,
  };
}

export function DataBadge(props: DataBadgeProps) {
  const { tone, shape, dot, Icon, content } = useResolved(props);
  const size = props.size ?? 'sm';

  return (
    <span
      data-slot="badge"
      className={cn(
        'badge',
        size === 'sm' && 'badge-sm',
        shape === 'pill' && 'badge-pill',
        shape === 'pill' && dot && 'badge-status',
        TONE_CLASSES[tone],
        props.className,
      )}
    >
      {dot ? <span aria-hidden className="badge-dot" /> : null}
      {Icon ? (
        <Icon className={cn('shrink-0', size === 'sm' ? 'size-3.5' : 'size-[18px]')} aria-hidden />
      ) : null}
      {content}
    </span>
  );
}
