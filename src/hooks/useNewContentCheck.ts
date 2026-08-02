import { useEffect, useRef } from 'react';
import { supabase } from '@/db/supabase';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useToast } from '@/hooks/use-toast';
import { getLastSyncTime } from '@/lib/offline-db';

/**
 * فحص دوري لوجود محتوى جديد في السيرفر.
 * يُعرض تنبيه للمستخدم عند اكتشاف صف أو مادة أو درس جديد.
 */
export function useNewContentCheck() {
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const notified = useRef(false);

  useEffect(() => {
    const check = async () => {
      if (!isOnline) {
        notified.current = false;
        return;
      }
      if (notified.current) return;

      try {
        const lastSync = await getLastSyncTime();
        if (!lastSync) return;

        const { data } = await supabase
          .from('classes')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!data?.created_at) return;

        const serverTime = new Date(data.created_at).getTime();
        const localTime = new Date(lastSync).getTime();

        if (serverTime > localTime) {
          notified.current = true;
          toast({
            title: 'محتوى جديد متاح',
            description: 'تم إضافة محتوى جديد. اضغط على زر التحديث لتحديث الصفوف والدروس.',
          });
        }
      } catch (err) {
        console.warn('[useNewContentCheck] فشل التحقق من المحتوى الجديد:', err);
      }
    };

    check();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') check();
    }, 5 * 60 * 1000); // كل 5 دقائق فقط عندما يكون التطبيق مرئياً
    return () => clearInterval(interval);
  }, [isOnline, toast]);
}
