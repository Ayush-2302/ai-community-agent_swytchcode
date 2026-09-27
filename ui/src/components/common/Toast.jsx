import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg border shadow-sm transition-all duration-200 ${
              t.type === "error"
                ? "bg-danger-soft border-border text-danger"
                : t.type === "warning"
                ? "bg-warning-soft border-border text-warning"
                : t.type === "info"
                ? "bg-info-soft border-border text-info"
                : "bg-surface border-border text-text-primary"
            }`}
          >
            {t.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            ) : t.type === "warning" ? (
              <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            ) : t.type === "info" ? (
              <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
              <div>{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-text-muted hover:text-text-primary p-0.5 rounded cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: console.log,
      removeToast: () => {},
    };
  }
  return context;
}
