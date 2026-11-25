import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type NumberInputProps = Omit<React.ComponentProps<typeof Input>, 'type'> & {
  /** Whole numbers: shows the numeric keyboard. A decimal value is reported by validation, not blocked. */
  integer?: boolean;
};

/** Number input with custom − / + buttons instead of the native spinner.
 *  Built on the shadcn `Input`; styles live in src/style/datepicker.css. */
function NumberInput({
  className,
  ref,
  disabled,
  readOnly,
  integer = false,
  ...props
}: NumberInputProps) {
  const { t } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const step = (direction: 'up' | 'down') => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    if (direction === 'up') {
      input.stepUp();
    } else {
      input.stepDown();
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <div className="number-control">
      <Input
        {...props}
        type="number"
        inputMode={integer ? 'numeric' : 'decimal'}
        ref={setRefs}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(className)}
      />
      <div className="number-stepper">
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || readOnly}
          aria-label={t('common.decrease')}
          onClick={() => {
            step('down');
          }}
        >
          −
        </button>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || readOnly}
          aria-label={t('common.increase')}
          onClick={() => {
            step('up');
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export { NumberInput };
