import React, { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export const LazyImage = memo<LazyImageProps>(({ 
  src, 
  alt, 
  className, 
  placeholderClassName,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    // استخدام IntersectionObserver مع إعدادات محسنة
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { 
        rootMargin: '100px', // تحميل الصور قبل ظهورها بـ 100px
        threshold: 0.01 // تحميل عند ظهور 1% من الصورة
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      {(!isLoaded || hasError) && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted flex items-center justify-center",
            placeholderClassName
          )} 
        >
          {hasError && (
            <div className="text-muted-foreground text-xs text-center p-2">
              <svg className="h-8 w-8 mx-auto mb-1 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!navigator.onLine && <span className="text-[10px]">لا يوجد اتصال</span>}
            </div>
          )}
        </div>
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={cn(
          "transition-opacity duration-200",
          isLoaded && !hasError ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // عدم إعادة الرسم إلا عند تغيير src أو className
  return prevProps.src === nextProps.src && prevProps.className === nextProps.className;
});
