import { useTranslation } from 'react-i18next';
import { env } from '@/env';

interface SidebarFooterProps {
  collapsed?: boolean;
}

export function SidebarFooter({ collapsed = false }: SidebarFooterProps) {
  const { t } = useTranslation();

  if (collapsed) {
    return (
      <div className="border-sidebar-border flex justify-center border-t pt-3">
        <span
          role="img"
          aria-label={t('shell.status')}
          title={t('shell.status')}
          className="bg-success size-2 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="border-sidebar-border text-b3 text-text-muted flex items-center justify-between gap-3 border-t pt-3">
      <span className="inline-flex min-w-0 items-center gap-2">
        <span aria-hidden className="bg-success size-2 shrink-0 rounded-full" />
        <span className="truncate">{t('shell.status')}</span>
      </span>
      <span dir="ltr" className="shrink-0 tabular-nums">
        {`v${env.VITE_APP_VERSION}`}
      </span>
    </div>
  );
}
