"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    if (!message) return;
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string) => showToast(message, "success");
  const error = (message: string) => showToast(message, "error");
  const warning = (message: string) => showToast(message, "warning");
  const info = (message: string) => showToast(message, "info");

  // Intercept window.alert calls globally to redirect to toast notifications
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.alert = (message: string) => {
        showToast(String(message), "info");
      };
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
                t.type === "success"
                  ? "bg-emerald-900/90 border-emerald-700/80 text-emerald-100 shadow-emerald-950/40"
                  : t.type === "error"
                  ? "bg-rose-900/90 border-rose-700/80 text-rose-100 shadow-rose-950/40"
                  : t.type === "warning"
                  ? "bg-amber-900/90 border-amber-700/80 text-amber-100 shadow-amber-950/40"
                  : "bg-zinc-900/90 border-zinc-700/80 text-zinc-100 shadow-zinc-950/40"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                {t.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                {t.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
                {t.type === "info" && <Info className="h-4 w-4 text-amber-400 shrink-0" />}

                <span className="text-xs font-bold leading-tight break-words">{t.message}</span>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      showToast: (msg: string) => {
        if (typeof window !== "undefined") alert(msg);
      },
      success: (msg: string) => {
        if (typeof window !== "undefined") alert(msg);
      },
      error: (msg: string) => {
        if (typeof window !== "undefined") alert(msg);
      },
      warning: (msg: string) => {
        if (typeof window !== "undefined") alert(msg);
      },
      info: (msg: string) => {
        if (typeof window !== "undefined") alert(msg);
      },
    };
  }
  return context;
}
