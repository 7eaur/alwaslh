import React, { Suspense, Component, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AccessProvider } from '@/context/AccessContext';
import { syncPendingStudentData } from '@/db/api';
import { LessonUploadProvider } from '@/contexts/LessonUploadContext';
import { QuestionGenerationProvider } from '@/contexts/QuestionGenerationContext';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import { OnlineStatusIndicator } from '@/components/OnlineStatusIndicator';

import { RouteGuard } from '@/components/common/RouteGuard';
import { routes } from '@/routes';
import { Toaster } from '@/components/ui/toaster';

// ======= Error Boundary =======
interface EBState { hasError: boolean; error?: Error }
class AppErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.error('AppErrorBoundary caught:', error);
    // إخفاء الـ loader في حال وجود خطأ لمنع تداخله مع واجهة الخطأ
    if (typeof (window as any).__hideHtmlLoader === 'function') {
      (window as any).__hideHtmlLoader();
    }
  }
  handleReload = () => {
    const doReload = () => { (window as Window).location.reload(); };
    if ('caches' in window) {
      caches.keys()
        .then((names) => Promise.all(names.map((n) => caches.delete(n))))
        .then(doReload);
    } else {
      doReload();
    }
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#fff',
          gap: 16, padding: 24, textAlign: 'center', fontFamily: 'Segoe UI, Tahoma, sans-serif'
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ color: '#e53e3e', margin: 0 }}>خطأ في التطبيق</h2>
          <p style={{ color: '#555', fontSize: 14, maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
            حدث خطأ غير متوقع. قد يكون بسبب كاش قديم. انقر الزر أدناه لإعادة التحميل وتنظيف الكاش.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: '#00a09d', color: '#fff', border: 'none',
              padding: '12px 32px', borderRadius: 12, fontSize: 16,
              cursor: 'pointer', fontWeight: 600
            }}
          >
            إعادة التحميل وتنظيف الكاش
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  // إخفاء html-loader فور اكتمال تحميل React
  useEffect(() => {
    if (typeof (window as any).__hideHtmlLoader === 'function') {
      (window as any).__hideHtmlLoader();
    }
    // مسح عداد إعادة التحميل عند نجاح التحميل
    sessionStorage.removeItem('reload-count');

    // مزامنة الملاحظات والأسئلة المحفوظة عند عودة الإنترنت
    const handleOnline = () => {
      syncPendingStudentData().catch(() => {});
    };
    window.addEventListener('online', handleOnline);
    // مزامنة أولية عند التحميل إذا كان النت متوفراً
    if (navigator.onLine) {
      syncPendingStudentData().catch(() => {});
    }
    return () => window.removeEventListener('online', handleOnline);
  }, []);
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AccessProvider>
          <LessonUploadProvider>
            <QuestionGenerationProvider>
              <BrowserRouter>
                <Suspense
                  fallback={
                    <div className="flex h-screen items-center justify-center bg-background">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  }
                >
                  <Routes>
                    {routes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={
                          <RouteGuard allowedRoles={route.allowedRoles}>
                            {route.element}
                          </RouteGuard>
                        }
                      />
                    ))}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <PWAInstallPrompt />
                  <OnlineStatusIndicator />
                </Suspense>
                <Toaster />
              </BrowserRouter>
            </QuestionGenerationProvider>
          </LessonUploadProvider>
        </AccessProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
};

export default App;
