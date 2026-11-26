import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleCheckIcon, OctagonXIcon, XIcon } from '@/components/ui/icons';
import { TOAST_MS, useToastStore, type Toast } from '@/shared/store/toast-store';
import { cn } from '@/shared/utils/cn';

function ToastItem({ toast }: { toast: Toast }) {
  const { t, i18n } = useTranslation();
  const dismiss = useToastStore((state) => state.dismiss);
  const text =
    'key' in toast.message
      ? i18n.exists(toast.message.key)
        ? t(toast.message.key)
        : toast.message.key
      : toast.message.text;

  useEffect(() => {
    if (toast.tone === 'error') {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      dismiss(toast.id);
    }, TOAST_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [dismiss, toast.id, toast.tone]);

  const Icon = toast.tone === 'success' ? CircleCheckIcon : OctagonXIcon;
  return (
    <span
      data-tone={toast.tone}
      className="border-stroke-strong bg-surface-elevated text-text-primary shadow-large animate-in fade-in slide-in-from-bottom-2 gap-inline px-row py-inline text-b1 pointer-events-auto flex items-start rounded-lg border"
    >
      <Icon
        aria-hidden="true"
        className={cn(
          'mt-0.5 size-4 shrink-0',
          toast.tone === 'success' ? 'text-success' : 'text-danger',
        )}
      />
      <span className="flex-1">{text}</span>
      <button
        type="button"
        onClick={() => {
          dismiss(toast.id);
        }}
        aria-label={t('ui.close')}
        className="text-text-muted hover:text-text-primary -m-1 grid size-7 shrink-0 place-items-center rounded-md"
      >
        <XIcon className="size-4" />
      </button>
    </span>
  );
}

/**
 * The toast region. Successes are announced politely; errors are announced right away and stay until
 * closed. Rendered once, by the layout that uses toasts (the admin layout).
 */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const polite = toasts.filter((toast) => toast.tone === 'success');
  const urgent = toasts.filter((toast) => toast.tone === 'error');
  return (
    <div className="gap-field end-row bottom-row pointer-events-none fixed z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col">
      <div role="alert" className="gap-field flex flex-col">
        {urgent.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
      <output aria-live="polite" className="gap-field flex flex-col">
        {polite.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </output>
    </div>
  );
}
