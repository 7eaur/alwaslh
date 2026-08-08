import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();
  const [showIndicator, setShowIndicator] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowIndicator(true);
      // إخفاء إشعار "غير متصل" تلقائياً بعد 5 ثوان
      const t = setTimeout(() => setShowIndicator(false), 5000);
      return () => clearTimeout(t);
    } else if (wasOffline) {
      // إزالة toast لتجنب الإزعاج المتكرر عند العودة للتطبيق
      setWasOffline(false);
      setShowIndicator(false);
    }
  }, [isOnline, wasOffline]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
      isOnline ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">متصل</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">غير متصل - التطبيق يعمل بدون إنترنت</span>
        </>
      )}
    </div>
  );
}
