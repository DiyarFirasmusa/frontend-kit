import type { ReactElement, ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RailTooltipProps {
  label: string;
  /** The interactive element that becomes the tooltip trigger. */
  render: ReactElement;
  children: ReactNode;
}

/** Name tooltip for an icon-only control in the collapsed sidebar rail. */
export function RailTooltip({ label, render, children }: RailTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={render}>{children}</TooltipTrigger>
      <TooltipContent side="inline-end">{label}</TooltipContent>
    </Tooltip>
  );
}
