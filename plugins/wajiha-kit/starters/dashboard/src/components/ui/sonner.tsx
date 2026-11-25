import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '@/context/theme-provider';
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from '@/lib/icons';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-(--success)" />,
        info: <InfoIcon className="size-4 text-(--info)" />,
        warning: <TriangleAlertIcon className="size-4 text-(--warning)" />,
        error: <OctagonXIcon className="size-4 text-(--danger)" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin text-(--text-muted)" />
        ),
      }}
      style={
        {
          '--normal-bg': 'var(--surface-elevated)',
          '--normal-text': 'var(--text-primary)',
          '--normal-border': 'var(--stroke-strong)',
          '--border-radius': 'var(--radius)',
          '--error-bg': 'var(--surface-elevated)',
          '--error-text': 'var(--text-primary)',
          '--error-border': 'var(--stroke-strong)',
          '--success-bg': 'var(--surface-elevated)',
          '--success-text': 'var(--text-primary)',
          '--success-border': 'var(--stroke-strong)',
          '--warning-bg': 'var(--surface-elevated)',
          '--warning-text': 'var(--text-primary)',
          '--warning-border': 'var(--stroke-strong)',
          '--info-bg': 'var(--surface-elevated)',
          '--info-text': 'var(--text-primary)',
          '--info-border': 'var(--stroke-strong)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
