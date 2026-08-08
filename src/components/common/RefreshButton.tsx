import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { preloadAllContent } from '@/lib/offline-db';
import { studentApi } from '@/db/api';
import { cn } from '@/lib/utils';

/**
 * زر تحديث يدوي للمحتوى (الصفوف / المواد / الدروس)
 */
export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isOnline = useOnlineStatus();

  const handleRefresh = async () => {
    if (!isOnline) {
      toast({
        title: 'لا يوجد اتصال بالإنترنت',
        description: 'التطبيق يعمل بالمحتوى المحفوظ محلياً',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await preloadAllContent(
        () => studentApi.getClasses(),
        (classId) => studentApi.getSubjects(classId),
        (subjectId) => studentApi.getLessons(subjectId),
        (msg) => console.log('[refresh]', msg)
      );
      window.dispatchEvent(new CustomEvent('content-refreshed', { detail: { success: true } }));
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تحميل أحدث الصفوف والمواد والدروس',
      });
    } catch (err) {
      console.warn('[RefreshButton] فشل التحديث:', err);
      toast({
        title: 'فشل التحديث',
        description: 'تعذر جلب المحتوى الجديد. يرجى إعادة المحاولة.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      disabled={loading}
      className="rounded-2xl hover:bg-muted shrink-0"
      aria-label="تحديث المحتوى"
      title="تحديث المحتوى"
    >
      <RefreshCw className={cn('h-5 w-5 text-muted-foreground', loading && 'animate-spin')} />
    </Button>
  );
}
