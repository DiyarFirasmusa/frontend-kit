import type { KeyboardEvent, ReactNode } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from '@/lib/icons';
import { cn } from '@/lib/utils';

export interface ClearableControlProps {
  /** Shows the clear button: a value is picked and the field may be emptied. */
  canClear: boolean;
  onClear: () => void;
  className?: string;
  children: ReactNode;
}

const CLEAR_KEYS = new Set(['Backspace', 'Delete']);

/**
 * Wraps a dropdown trigger (`.control`) and overlays a clear button before its
 * chevron. The trigger keeps its size; only its text area narrows while the
 * button shows. Backspace or Delete on the focused trigger also clears.
 */
export function ClearableControl({
  canClear,
  onClear,
  className,
  children,
}: ClearableControlProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);

  const focusTrigger = () => {
    rootRef.current?.querySelector<HTMLElement>('.control')?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;
    if (
      !canClear ||
      !CLEAR_KEYS.has(event.key) ||
      !(target instanceof HTMLElement) ||
      target.parentElement !== event.currentTarget ||
      !target.classList.contains('control')
    ) {
      return;
    }
    event.preventDefault();
    onClear();
  };

  return (
    <div
      ref={rootRef}
      data-slot="clearable-control"
      data-clearable={canClear || undefined}
      className={cn('control-clearable', className)}
      onKeyDown={handleKeyDown}
    >
      {children}
      {canClear ? (
        <button
          type="button"
          className="control-clear"
          aria-label={t('common.clearValue')}
          title={t('common.clearValue')}
          onClick={() => {
            onClear();
            focusTrigger();
          }}
        >
          <X aria-hidden className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
