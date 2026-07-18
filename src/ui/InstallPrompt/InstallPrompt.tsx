import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'icore_install_dismissed';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed / running as a standalone app — never show.
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;
    if (isStandalone) return;

    // Dismissed already this session (sessionStorage clears when the tab/
    // browser session ends — exactly the "don't show again until a new
    // session" behavior we want, without persisting the dismissal forever).
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener(
      'appinstalled',
      handleAppInstalled as EventListener,
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener(
        'appinstalled',
        handleAppInstalled as EventListener,
      );
    };
  }, []);

  function handleDismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <div className='fixed bottom-20 inset-x-4 z-40 animate-page-in'>
      <div className='bg-navy-500 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3'>
        <div className='h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0'>
          <Download className='h-4 w-4' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium'>Install ICORE SMS</p>
          <p className='text-xs text-navy-200'>
            Add to your home screen for quick access.
          </p>
        </div>
        <button
          onClick={handleInstall}
          className='text-xs font-semibold bg-white text-navy-500 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-navy-100 transition-colors shrink-0'>
          Install
        </button>
        <button
          onClick={handleDismiss}
          className='text-navy-200 hover:text-white cursor-pointer p-1 shrink-0'
          aria-label='Dismiss'>
          <X className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
