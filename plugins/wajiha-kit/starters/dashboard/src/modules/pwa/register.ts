import { toast } from 'sonner';
import { registerSW } from 'virtual:pwa-register';
import i18n from '@/lib/i18n/i18n';

/**
 * Registers the service worker (only does anything when VITE_PWA=true) and
 * offers a reload when a new version is ready.
 */
export function registerServiceWorker(): void {
  if (import.meta.env.VITE_PWA !== 'true') {
    return;
  }
  const update = registerSW({
    onNeedRefresh() {
      toast(i18n.t('pwa.updateAvailable'), {
        duration: Infinity,
        action: {
          label: i18n.t('pwa.reload'),
          onClick: () => {
            void update(true);
          },
        },
      });
    },
  });
}
