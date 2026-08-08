import { useState, useCallback, useEffect } from 'react';

type ToastVariant = 'default' | 'destructive';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let memoryToasts: Toast[] = [];

const notify = () => {
  listeners.forEach((l) => l([...memoryToasts]));
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const toast = useCallback(({ title, description, variant = 'default', duration = 3000 }: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, title, description, variant };
    memoryToasts = [...memoryToasts, newToast];
    notify();
    
    setTimeout(() => {
      memoryToasts = memoryToasts.filter((t) => t.id !== id);
      notify();
    }, duration);
  }, []);

  return { toast, toasts };
};
