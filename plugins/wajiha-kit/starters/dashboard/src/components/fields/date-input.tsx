import { Popover } from '@base-ui/react/popover';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight } from '@/lib/icons';
import { cn } from '@/lib/utils';

type DateInputProps = Omit<React.ComponentProps<'input'>, 'type'>;

interface ViewMonth {
  year: number;
  month: number;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseIso(value: unknown): (ViewMonth & { day: number }) | null {
  if (typeof value !== 'string') {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

function todayIso(): string {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

function setNativeValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Custom calendar replacing the browser's native date picker. The native
 *  input stays in the DOM (visually hidden) so forms, labels and tests keep
 *  working with a plain `type="date"` control. */
function DateInput({
  className,
  value,
  min,
  max,
  disabled,
  placeholder,
  ref,
  ...props
}: DateInputProps) {
  const { t, i18n } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const selected = parseIso(value);
  const initialView = selected ?? parseIso(todayIso());
  const [view, setView] = React.useState<ViewMonth>({
    year: initialView?.year ?? new Date().getFullYear(),
    month: initialView?.month ?? new Date().getMonth(),
  });

  const locale = `${i18n.language.startsWith('ar') ? 'ar' : 'en'}-u-nu-latn`;
  const weekStart = i18n.language.startsWith('ar') ? 6 : 0;

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const monthTitle = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(view.year, view.month, 1)));

  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const dayIndex = (weekStart + index) % 7;
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2023, 0, 1 + dayIndex)));
  });

  const firstWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const leading = (firstWeekday - weekStart + 7) % 7;
  const daysInMonth = new Date(
    Date.UTC(view.year, view.month + 1, 0),
  ).getUTCDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - leading + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const shift = (months: number) => {
    setView((current) => {
      const next = new Date(Date.UTC(current.year, current.month + months, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  };

  const commit = (next: string) => {
    if (inputRef.current) {
      setNativeValue(inputRef.current, next);
    }
    setOpen(false);
  };

  const isDisabledDay = (iso: string) =>
    (typeof min === 'string' && min !== '' && iso < min) ||
    (typeof max === 'string' && max !== '' && iso > max);

  const text = typeof value === 'string' ? value : '';
  const today = todayIso();

  return (
    <div className="date-picker">
      <input
        {...props}
        ref={setRefs}
        type="date"
        value={text}
        min={min}
        max={max}
        disabled={disabled}
        tabIndex={-1}
        className="sr-only"
      />
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          if (next && selected) {
            setView({ year: selected.year, month: selected.month });
          }
          setOpen(next);
        }}
      >
        <Popover.Trigger
          disabled={disabled}
          aria-label={text || placeholder || t('common.pickDate')}
          aria-invalid={props['aria-invalid']}
          className={cn(
            'control date-picker-trigger justify-between',
            !text && 'date-picker-empty',
            className,
          )}
        >
          <span dir="ltr" className="tabular-nums">
            {text || placeholder || t('common.pickDate')}
          </span>
          <Calendar className="text-text-secondary size-4 shrink-0" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner
            side="bottom"
            align="start"
            sideOffset={4}
            className="isolate z-50"
          >
            <Popover.Popup className="date-popup">
              <div className="date-popup-header">
                <button
                  type="button"
                  className="date-popup-nav"
                  aria-label={t('common.previousMonth')}
                  onClick={() => {
                    shift(-1);
                  }}
                >
                  <ChevronLeft className="size-4 rtl:rotate-180" />
                </button>
                <span className="date-popup-title">{monthTitle}</span>
                <button
                  type="button"
                  className="date-popup-nav"
                  aria-label={t('common.nextMonth')}
                  onClick={() => {
                    shift(1);
                  }}
                >
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </button>
              </div>
              <div className="date-popup-year">
                <button
                  type="button"
                  className="date-popup-nav"
                  aria-label={t('common.previousYear')}
                  onClick={() => {
                    shift(-12);
                  }}
                >
                  −
                </button>
                <span className="tabular-nums">{view.year}</span>
                <button
                  type="button"
                  className="date-popup-nav"
                  aria-label={t('common.nextYear')}
                  onClick={() => {
                    shift(12);
                  }}
                >
                  +
                </button>
              </div>
              <div className="date-popup-grid" role="grid">
                {weekdays.map((name) => (
                  <span key={name} className="date-popup-weekday">
                    {name}
                  </span>
                ))}
                {cells.map((day, index) => {
                  if (day === null) {
                    return <span key={`empty-${index}`} />;
                  }
                  const iso = toIso(view.year, view.month, day);
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={isDisabledDay(iso)}
                      data-selected={iso === text || undefined}
                      data-today={iso === today || undefined}
                      className="date-popup-day"
                      onClick={() => {
                        commit(iso);
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="date-popup-footer">
                <button
                  type="button"
                  className="date-popup-link"
                  disabled={isDisabledDay(today)}
                  onClick={() => {
                    commit(today);
                  }}
                >
                  {t('common.today')}
                </button>
                <button
                  type="button"
                  className="date-popup-link"
                  onClick={() => {
                    commit('');
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

export { DateInput };
