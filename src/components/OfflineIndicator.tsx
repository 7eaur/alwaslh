import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * مكون لعرض حالة الاتصال بالإنترنت
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      // إخفاء الرسالة بعد 5 ثواني تلقائياً
      const t = setTimeout(() => setShowOfflineMessage(false), 5000);
      return () => clearTimeout(t);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // عرض رسالة عند الاتصال مرة أخرى
  useEffect(() => {
    if (isOnline && showOfflineMessage === false) {
      const wasOffline = sessionStorage.getItem('was_offline');
      if (wasOffline === 'true') {
        setShowOfflineMessage(true);
        sessionStorage.removeItem('was_offline');
        setTimeout(() => setShowOfflineMessage(false), 3000);
      }
    } else if (!isOnline) {
      sessionStorage.setItem('was_offline', 'true');
    }
  }, [isOnline]);

  if (!showOfflineMessage) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm ${
        isOnline 
          ? 'bg-emerald-500 text-white' 
          : 'bg-orange-500 text-white'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5" />
            <span>تم الاتصال بالإنترنت ✓</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" />
            <span>وضع بدون إنترنت - يمكنك التصفح باستخدام البيانات المحفوظة</span>
          </>
        )}
      </div>
    </div>
  );
}
