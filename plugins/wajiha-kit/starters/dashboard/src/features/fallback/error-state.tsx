import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import type { IconComponent } from '@/lib/icons';
import { cn } from '@/lib/utils';

export type ErrorTone = 'warning' | 'danger' | 'info';

const TONE_CLASS: Record<ErrorTone, string> = {
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
};

/* Goes back when the router has a previous entry; a directly opened error
   route has none, so it falls back to home instead of a dead button. */
export function useBackAction(): () => void {
  const navigate = useNavigate();
  const { history } = useRouter();
  return () => {
    if (history.canGoBack()) {
      history.back();
      return;
    }
    void navigate({ to: '/' });
  };
}

/* Shared navigation action for the primary button; keeps the page files free
   of inline navigate wiring. */
export function useNavigateAction(to: '/' | '/login'): () => void {
  const navigate = useNavigate();
  return () => {
    void navigate({ to });
  };
}

export interface ErrorAction {
  label: string;
  onClick: () => void;
}

export interface ErrorStateProps {
  code: string;
  title: string;
  description: string;
  icon: IconComponent;
  tone: ErrorTone;
  primary: ErrorAction;
  secondary: ErrorAction;
  extra?: ErrorAction;
}

export function ErrorState({
  code,
  title,
  description,
  icon: Icon,
  tone,
  primary,
  secondary,
  extra,
}: ErrorStateProps) {
  return (
    <main className="p-page flex min-h-svh w-full items-center justify-center">
      <section className="rounded-modal border-stroke-strong bg-surface/80 shadow-large gap-card p-card animate-in fade-in zoom-in-90 flex w-full max-w-md flex-col items-center border text-center backdrop-blur-xl duration-300">
        <span
          className={cn(
            'inline-flex size-11 items-center justify-center rounded-xl',
            TONE_CLASS[tone],
          )}
        >
          <Icon className="size-5" />
        </span>
        <p className="text-display text-primary-text tabular-nums">{code}</p>
        <div className="gap-field flex flex-col items-center">
          <h1 className="text-h2 text-text-primary">{title}</h1>
          <p className="text-b2 text-text-secondary">{description}</p>
        </div>
        <div className="gap-row flex flex-wrap items-center justify-center">
          <Button size="lg" onClick={primary.onClick}>
            {primary.label}
          </Button>
          <Button variant="outline" size="lg" onClick={secondary.onClick}>
            {secondary.label}
          </Button>
          {extra ? (
            <Button variant="outline" size="lg" onClick={extra.onClick}>
              {extra.label}
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
