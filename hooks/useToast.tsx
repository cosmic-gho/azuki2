'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const fullToast: Toast = { id, duration: 4000, ...toast };
    setToasts(prev => [...prev, fullToast]);
    if (fullToast.duration && fullToast.duration > 0) {
      setTimeout(() => removeToast(id), fullToast.duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((title: string, message?: string, duration?: number) =>
    addToast({ type: 'success', title, message, duration }), [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) =>
    addToast({ type: 'error', title, message, duration }), [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) =>
    addToast({ type: 'warning', title, message, duration }), [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) =>
    addToast({ type: 'info', title, message, duration }), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  const getIcon = (type: ToastType) => {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type];
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            {toast.message && <div className="toast-message">{toast.message}</div>}
          </div>
          <button
            className="toast-close"
            onClick={() => onClose(toast.id)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
