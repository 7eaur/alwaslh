import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export const Toaster: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none arabic-font">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className={cn(
            "p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-in pointer-events-auto",
            t.variant === 'destructive' 
              ? "bg-rose-50 border-rose-200 text-rose-900" 
              : "bg-white border-primary/10 text-primary"
          )}
        >
          {t.variant === 'destructive' ? (
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            {t.title && <p className="font-bold text-sm truncate">{t.title}</p>}
            {t.description && <p className="text-xs opacity-80 line-clamp-2">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

// Actually, let's make it a functional component that App.tsx can use
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
