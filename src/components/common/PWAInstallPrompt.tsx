import React, { useState, useEffect } from 'react';
import { Download, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const DISMISS_KEY = 'pwa_install_dismissed';
const OPEN_FROM_HOME_DISMISS_KEY = 'pwa_open_from_home_dismissed';
const INSTALLED_BANNER_SHOWN_KEY = 'pwa_installed_banner_shown';
const DISMISS_DAYS = 7;

type BrowserType = 'chrome' | 'edge' | 'samsung' | 'firefox' | 'safari' | 'other';

function detectBrowser(): BrowserType {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('samsung')) return 'samsung';
  if (ua.includes('edg')) return 'edge';
  if (ua.includes('chrome') && ua.includes('crios') === false && ua.includes(' chromium') === false) return 'chrome';
  if (ua.includes('firefox') || ua.includes('fxios')) return 'firefox';
  if (ua.includes('safari') && (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod'))) return 'safari';
  return 'other';
}

function isInstalled(): boolean {
  const displayMode =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (navigator as any).standalone === true;

  const isAndroidTwa = document.referrer?.startsWith('android-app://');

  return displayMode || isAndroidTwa;
}

function setInstallFlag() {
  try {
    localStorage.setItem('pwa_installed', 'true');
  } catch { /* تجاهل */ }
}

function isPreviewOrIframe(): boolean {
  try {
    if (window.self !== window.top) return true;
    const host = window.location.hostname.toLowerCase();
    const href = window.location.href.toLowerCase();
    return host.includes('medo.dev') || href.includes('/projects/');
  } catch {
    return true;
  }
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = new Date(raw);
    const now = new Date();
    const diffDays = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < DISMISS_DAYS;
  } catch {
    return false;
  }
}

function wasOpenFromHomeDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(OPEN_FROM_HOME_DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = new Date(raw);
    const now = new Date();
    const diffDays = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < DISMISS_DAYS;
  } catch {
    return false;
  }
}

function wasInstalledBannerShown(): boolean {
  try {
    return localStorage.getItem(INSTALLED_BANNER_SHOWN_KEY) === 'true';
  } catch {
    return false;
  }
}

function markInstalledBannerShown() {
  try {
    localStorage.setItem(INSTALLED_BANNER_SHOWN_KEY, 'true');
  } catch { /* تجاهل */ }
}

function getGlobalDeferredPrompt(): any | null {
  return (window as any).__deferredInstallPrompt || null;
}

function clearGlobalDeferredPrompt() {
  (window as any).__deferredInstallPrompt = null;
}

const PWAInstallPrompt: React.FC = () => {
  const { profile, updateProfileFlag } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstalled, setShowInstalled] = useState(false);
  const [showOpenFromHome, setShowOpenFromHome] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setIsPreview(isPreviewOrIframe());

    // إذا كان التطبيق مثبتاً فعلياً: نظهر رسالة "مثبت مسبقاً" مرة واحدة فقط
    if (isInstalled()) {
      setInstallFlag();
      if (profile?.install_prompt_shown || wasInstalledBannerShown()) {
        setShowInstalled(false);
      } else {
        setShowInstalled(true);
      }
      return;
    }

    // إذا كان التطبيق مثبتاً (localStorage) لكن المستخدم يفتح من المتصفح
    // نعرض له تنبيهاً بفتحه من الشاشة الرئيسية
    try {
      if (localStorage.getItem('pwa_installed') === 'true' && !isInstalled() && !wasOpenFromHomeDismissedRecently()) {
        setShowOpenFromHome(true);
      }
    } catch { /* تجاهل */ }

    if (wasDismissedRecently()) return;

    // استخدام الحدث الملتقط مبكراً في index.html إن وجد
    const existing = getGlobalDeferredPrompt();
    if (existing) {
      setDeferredPrompt(existing);
      setShowBanner(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setGlobalDeferredPrompt(e);
      setShowBanner(true);
    };

    const installedHandler = () => {
      setInstallFlag();
      setShowBanner(false);
      setShowInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [profile?.install_prompt_shown]);

  // إخفاء بانر "التطبيق مثبت" تلقائياً بعد ثانيتين
  useEffect(() => {
    if (!showInstalled) return;
    const timer = setTimeout(() => {
      setShowInstalled(false);
      markInstalledBannerShown();
      updateProfileFlag('install_prompt_shown', true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [showInstalled, updateProfileFlag]);

  function setGlobalDeferredPrompt(e: any) {
    (window as any).__deferredInstallPrompt = e;
  }

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    } catch { /* تجاهل */ }
  };

  const handleInstallClick = () => {
    const promptEvent = deferredPrompt || getGlobalDeferredPrompt();

    if (promptEvent && typeof promptEvent.prompt === 'function') {
      promptEvent.prompt();
      promptEvent.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallFlag();
          setShowBanner(false);
          updateProfileFlag('install_prompt_shown', true);
        }
        setDeferredPrompt(null);
        clearGlobalDeferredPrompt();
      });
      return;
    }

    // لا يتوفر حدث التثبيت في هذا المتصفح/الحالة
    toast('التثبيت التلقائي غير متاح في هذا المتصفح، يرجى استخدام زر التثبيت في قائمة المتصفح.', {
      duration: 4000,
    });
  };

  const handleOpenFromHomeDismiss = () => {
    setShowOpenFromHome(false);
    try {
      localStorage.setItem(OPEN_FROM_HOME_DISMISS_KEY, new Date().toISOString());
    } catch { /* تجاهل */ }
  };

  if (!showBanner && !showInstalled && !showOpenFromHome && !isPreview) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] md:bottom-8 md:left-8 md:right-auto md:w-80 flex flex-col gap-3">
      {isPreview && (
        <div className="animate-bounce-in bg-warning text-white p-4 rounded-2xl shadow-2xl border-2 border-white/20 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ExternalLink className="h-5 w-5" />
          </div>
          <div className="arabic-font flex-1">
            <h4 className="font-bold text-xs">أنت في معاينة المنصة</h4>
            <p className="text-[10px] opacity-90 leading-relaxed mt-1">
              لاختبار التطبيق المثبت، افتح الرابط المنشور مباشرة من متصفح الجهاز، ثم ثبّته من هناك.
            </p>
          </div>
        </div>
      )}
      {showOpenFromHome && (
        <div className="animate-bounce-in bg-warning text-white p-3 rounded-2xl shadow-2xl border-2 border-white/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div className="arabic-font">
              <h4 className="font-bold text-xs">افتح التطبيق من الشاشة الرئيسية</h4>
              <p className="text-[9px] opacity-90 leading-tight">التطبيق مثبت. استخدم الأيقونة للدخول مباشرة.</p>
            </div>
          </div>
          <button
            onClick={handleOpenFromHomeDismiss}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="إغلاق"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {showInstalled ? (
        <div className="animate-bounce-in bg-success text-white p-3 rounded-2xl shadow-2xl border-2 border-white/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div className="arabic-font">
              <h4 className="font-bold text-xs">التطبيق مثبت مسبقاً</h4>
              <p className="text-[9px] opacity-90 leading-tight">يمكنك فتحه من الشاشة الرئيسية</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowInstalled(false);
              markInstalledBannerShown();
              updateProfileFlag('install_prompt_shown', true);
            }}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="إغلاق"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="animate-bounce-in bg-primary text-primary-foreground p-3 rounded-2xl shadow-2xl border-2 border-white/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div className="arabic-font">
              <h4 className="font-bold text-xs">تثبيت التطبيق</h4>
              <p className="text-[9px] opacity-90 leading-tight">تثبيت الوسيلة الذكية على جهازك</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              onClick={handleInstallClick}
              size="sm"
              variant="secondary"
              className="font-bold rounded-lg text-[10px] h-8 px-3"
            >
              تثبيت
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="إغلاق"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAInstallPrompt;
