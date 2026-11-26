import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from '@/components/ui/icons';
import { cn } from '@/shared/utils/cn';

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

  // Backspace or Delete on the trigger (the wrapper's direct `.control` child) clears the value. A native
  // listener on the wrapper: the key event bubbles up from the trigger, which is the interactive element.
  useEffect(() => {
    const root = rootRef.current;
    if (root === null || !canClear) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        !CLEAR_KEYS.has(event.key) ||
        !(target instanceof HTMLElement) ||
        target.parentElement !== root ||
        !target.classList.contains('control')
      ) {
        return;
      }
      event.preventDefault();
      onClear();
    };
    root.addEventListener('keydown', onKeyDown);
    return () => {
      root.removeEventListener('keydown', onKeyDown);
    };
  }, [canClear, onClear]);

  return (
    <div
      ref={rootRef}
      data-slot="clearable-control"
      data-clearable={canClear || undefined}
      className={cn('control-clearable', className)}
    >
      {children}
      {canClear ? (
        <button
          type="button"
          className="control-clear"
          aria-label={t('ui.clearValue')}
          title={t('ui.clearValue')}
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
