import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isInstallPromptEvent(e: Event): e is BeforeInstallPromptEvent {
  return 'prompt' in e && typeof e.prompt === 'function';
}

/**
 * Lets a button offer "install app". `canInstall` turns true when the browser
 * fires `beforeinstallprompt` (Chromium; iOS Safari has no such event).
 */
export function usePwaInstall(): {
  canInstall: boolean;
  install: () => Promise<void>;
} {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event): void => {
      e.preventDefault();
      if (isInstallPromptEvent(e)) {
        setEvent(e);
      }
    };
    const onInstalled = (): void => {
      setEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!event) {
      return;
    }
    await event.prompt();
    await event.userChoice;
    setEvent(null);
  }, [event]);

  return { canInstall: event !== null, install };
}
