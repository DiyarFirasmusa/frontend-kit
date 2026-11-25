import { Popover } from '@base-ui/react/popover';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from '@/lib/icons';
import { cn } from '@/lib/utils';

type TimeInputProps = Omit<React.ComponentProps<'input'>, 'type'>;

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0'),
);

function setNativeValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function Column({
  items,
  selected,
  label,
  onPick,
}: {
  items: string[];
  selected: string | null;
  label: string;
  onPick: (item: string) => void;
}) {
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const active = listRef.current?.querySelector('[data-selected]');
    active?.scrollIntoView({ block: 'center' });
  }, []);

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={label}
      className="time-popup-column"
    >
      {items.map((item) => (
        <button
          key={item}
          type="button"
          role="option"
          aria-selected={item === selected}
          data-selected={item === selected || undefined}
          className="time-popup-item"
          onClick={() => {
            onPick(item);
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function getCurrentTime() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Custom time picker replacing the browser's native one. Like `DateInput`
 *  the native input stays in the DOM (visually hidden) for forms and tests. */
function TimeInput({
  className,
  value,
  disabled,
  placeholder,
  ref,
  ...props
}: TimeInputProps) {
  const { t } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const text = typeof value === 'string' ? value : '';
  const [hour, minute] = text.split(':');
  const hh = hour && /^\d{2}$/.test(hour) ? hour : null;
  const mm = minute && /^\d{2}/.test(minute) ? minute.slice(0, 2) : null;

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const commit = (next: string, close = false) => {
    if (inputRef.current) {
      setNativeValue(inputRef.current, next);
    }
    if (close) {
      setOpen(false);
    }
  };

  return (
    <div className="date-picker">
      <input
        {...props}
        ref={setRefs}
        type="time"
        value={text}
        disabled={disabled}
        tabIndex={-1}
        className="sr-only"
      />
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          disabled={disabled}
          aria-label={text || placeholder || t('common.pickTime')}
          aria-invalid={props['aria-invalid']}
          className={cn(
            'control date-picker-trigger justify-between',
            !text && 'date-picker-empty',
            className,
          )}
        >
          <span dir="ltr" className="tabular-nums">
            {text.slice(0, 5) || placeholder || t('common.pickTime')}
          </span>
          <Clock className="text-text-secondary size-4 shrink-0" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner
            side="bottom"
            align="start"
            sideOffset={4}
            className="isolate z-50"
          >
            <Popover.Popup className="date-popup time-popup">
              <div className="time-popup-columns" dir="ltr">
                <Column
                  items={HOURS}
                  selected={hh}
                  label={t('common.hour')}
                  onPick={(item) => {
                    commit(`${item}:${mm ?? '00'}`);
                  }}
                />
                <Column
                  items={MINUTES}
                  selected={mm}
                  label={t('common.minute')}
                  onPick={(item) => {
                    commit(`${hh ?? '00'}:${item}`);
                  }}
                />
              </div>
              <div className="date-popup-footer">
                <button
                  type="button"
                  className="date-popup-link"
                  onClick={() => {
                    commit(getCurrentTime(), true);
                  }}
                >
                  {t('common.now')}
                </button>
                <button
                  type="button"
                  className="date-popup-link"
                  onClick={() => {
                    commit('', true);
                  }}
                >
                  {t('common.clear')}
                </button>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export { TimeInput };
