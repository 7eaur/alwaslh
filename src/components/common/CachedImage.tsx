import React, { useEffect, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageFromDB, saveImageToDB } from '@/lib/offline-db';
import { cn } from '@/lib/utils';
import { WifiOff, AlertCircle } from 'lucide-react';

interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  /** تحميل الصورة فقط عند الاقتراب من منفذ العرض (true) أو فوراً (false) */
  lazy?: boolean;
}

const CachedImage: React.FC<CachedImageProps> = ({ src, alt, className = '', onLoad, onError, lazy = true }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const objectUrlRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // مراقبة دخول الصورة في منفذ العرض (lazy loading)
  useEffect(() => {
    if (!lazy) return;
    const el = containerRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { rootMargin: '200px', threshold: 0 }
    );

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy]);

  useEffect(() => {
    if (!isVisible || !src) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true); setError(false);

      // 1) محاولة جلب الصورة من IndexedDB أولاً
      const cached = await getImageFromDB(src);
      if (cached) {
        if (!cancelled) {
          objectUrlRef.current = cached;
          setImgSrc(cached);
          setLoading(false);
          onLoad?.();
        }
        return;
      }

      // 2) إذا لم تكن مخزنة، حمّل من الشبكة وخزّنها
      try {
        // نحاول التحميل ثم نخزن
        await saveImageToDB(src);
        const refreshed = await getImageFromDB(src);
        if (!cancelled) {
          if (refreshed) {
            objectUrlRef.current = refreshed;
            setImgSrc(refreshed);
            setLoading(false);
            onLoad?.();
          } else {
            // fallback: استخدم الرابط المباشر
            setImgSrc(src);
            setLoading(false);
            onLoad?.();
          }
        }
      } catch {
        // 3) فشل الشبكة → نستخدم الرابط المباشر (قد يفشل لكن نحاول)
        if (!cancelled) {
          setImgSrc(src);
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src, onLoad, isVisible]);

  const handleError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };

  if (!isVisible) {
    return (
      <div ref={containerRef} className={cn('w-full min-h-48 bg-muted/50 animate-pulse', className)} />
    );
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center w-full min-h-48 bg-muted/50', className)}>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <span className="text-xs text-muted-foreground font-bold">جاري تحميل الصورة...</span>
        </div>
      </div>
    );
  }

  if (error || !imgSrc) {
    return (
      <div className={`flex flex-col items-center justify-center bg-rose-50 border border-rose-100 rounded-xl p-6 gap-2 ${className}`}>
        <AlertCircle className="h-8 w-8 text-rose-400" />
        <p className="text-sm font-bold text-rose-600 text-center">تعذر تحميل الصورة</p>
        {!navigator.onLine && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <WifiOff className="h-3 w-3" />
            <span>لا يوجد اتصال بالإنترنت</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="eager"
      decoding="async"
    />
  );
};

export default CachedImage;
