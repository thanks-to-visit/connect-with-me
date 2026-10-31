import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastContextType {
  showToast: (options: { id?: string; variant: ToastVariant; message: string; duration?: number }) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    ({
      id = Math.random().toString(36).substring(2, 9),
      variant,
      message,
      duration = 3000,
    }: {
      id?: string;
      variant: ToastVariant;
      message: string;
      duration?: number;
    }) => {
      // Clear existing timer if toast is already active (deduplication)
      const existingTimer = timersRef.current.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      setToasts((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        return [...filtered, { id, variant, message }];
      });

      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Toast viewport */}
      <div
        className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 pointer-events-none items-center sm:items-end"
        tabIndex={-1}
      >
        {toasts.map((toast) => {
          const isError = toast.variant === 'error';
          const isWarning = toast.variant === 'warning';
          const isSuccess = toast.variant === 'success';

          const icon = isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0" aria-hidden="true" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
          ) : (
            <Info className="w-5 h-5 text-blue-700 shrink-0" aria-hidden="true" />
          );

          const colorClasses = isSuccess
            ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-emerald-900/10'
            : isError
            ? 'bg-rose-50 text-rose-950 border-rose-300 shadow-rose-900/10'
            : isWarning
            ? 'bg-amber-50 text-amber-950 border-amber-300 shadow-amber-900/10'
            : 'bg-blue-50 text-blue-950 border-blue-300 shadow-blue-900/10';

          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              aria-live={isError ? 'assertive' : 'polite'}
              aria-atomic="true"
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all duration-200 max-w-md w-full sm:w-auto ${colorClasses}`}
            >
              <div className="flex items-center gap-2.5">
                {icon}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
