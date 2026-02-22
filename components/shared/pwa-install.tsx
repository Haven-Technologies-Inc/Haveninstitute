'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'haven-pwa-dismissed';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Hide banner if app is already installed
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISS_KEY, 'true');
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg"
        >
          {/* Gradient border wrapper */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20">
            <div className="relative rounded-2xl bg-white dark:bg-zinc-900 p-4 sm:p-5">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Dismiss install prompt"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-4">
                {/* App icon */}
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <span className="text-lg font-bold text-white">H</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Install Haven Study
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Add Haven Institute to your home screen for quick access, offline
                    study, and push notification reminders.
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-3">
                    <Button
                      onClick={handleInstall}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:brightness-110 transition-all duration-300 h-8 px-4 text-xs"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Install App
                    </Button>
                    <button
                      onClick={handleDismiss}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Not now
                    </button>
                  </div>
                </div>

                {/* Phone icon decoration */}
                <div className="hidden sm:flex flex-shrink-0 items-center justify-center h-10 w-10 rounded-lg bg-indigo-500/10">
                  <Smartphone className="h-5 w-5 text-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
