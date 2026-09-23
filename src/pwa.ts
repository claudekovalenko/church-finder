/// <reference types="vite-plugin-pwa/client" />
import { useEffect, useRef, useState } from 'react';

export interface ServiceWorkerState {
  /** A new build is installed and waiting for permission to take over. */
  needRefresh: boolean;
  /** Everything needed to run with no network is cached. */
  offlineReady: boolean;
  /** Activate the waiting build and reload. */
  update: () => void;
  /** Stop showing whichever notice is up. */
  dismiss: () => void;
}

/**
 * Wires up the service worker and reports what it is doing, so the app can
 * tell the user rather than silently reloading under them.
 *
 * Registration is best-effort. In the artifact embed the plugin is disabled and
 * this resolves to a no-op; in a plain `file://` open, or a browser with
 * service workers switched off, it fails quietly and the app still works —
 * nothing here is load-bearing, because all the state is in local storage.
 */
export function useServiceWorker(): ServiceWorkerState {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const updateRef = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    let cancelled = false;

    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        if (cancelled) return;
        updateRef.current = registerSW({
          immediate: true,
          onNeedRefresh: () => setNeedRefresh(true),
          onOfflineReady: () => setOfflineReady(true),
        });
      })
      .catch(() => {
        // No service worker here. Not a problem worth reporting.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    needRefresh,
    offlineReady,
    update: () => {
      setNeedRefresh(false);
      void updateRef.current?.(true);
    },
    dismiss: () => {
      setNeedRefresh(false);
      setOfflineReady(false);
    },
  };
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Chromium fires `beforeinstallprompt` and lets the page choose when to ask.
 * Returns null where that does not happen — Safari and Firefox have no such
 * event, and install is done from the browser's own menu.
 */
export function useInstallPrompt(): { canInstall: boolean; install: () => void } {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    function onPrompt(e: Event) {
      // Holding the event back is what lets the page put the invitation
      // somewhere sensible instead of the browser's own mini-infobar.
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
    }
    function onInstalled() {
      setEvent(null);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  return {
    canInstall: event !== null,
    install: () => {
      const e = event;
      if (!e) return;
      setEvent(null);
      void e.prompt();
    },
  };
}
