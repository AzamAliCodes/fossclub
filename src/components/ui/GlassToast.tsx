"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { playClickSound, playSuccessSound } from "@/lib/sound";

export type ToastType = "delete" | "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface GlassToastContextType {
  showToast: (options: { type: ToastType; title: string; message?: string; duration?: number }) => void;
  deleted: (title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  confirmDelete: (options: ConfirmDialogOptions) => void;
}

const GlassToastContext = createContext<GlassToastContextType | null>(null);

export function useGlassToast() {
  const context = useContext(GlassToastContext);
  if (!context) {
    throw new Error("useGlassToast must be used within a GlassToastProvider");
  }
  return context;
}

export function GlassToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: { type: ToastType; title: string; message?: string; duration?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (type === "delete" || type === "success") {
        try { playSuccessSound(); } catch {}
      } else {
        try { playClickSound(); } catch {}
      }

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const deleted = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "delete", title, message });
    },
    [showToast]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "success", title, message });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "error", title, message });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "info", title, message });
    },
    [showToast]
  );

  const confirmDelete = useCallback((options: ConfirmDialogOptions) => {
    try { playClickSound(); } catch {}
    setConfirmDialog(options);
  }, []);

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    try { playClickSound(); } catch {}
    const onConfirm = confirmDialog.onConfirm;
    setConfirmDialog(null);
    await onConfirm();
  };

  const handleCancel = () => {
    if (!confirmDialog) return;
    try { playClickSound(); } catch {}
    confirmDialog.onCancel?.();
    setConfirmDialog(null);
  };

  return (
    <GlassToastContext.Provider value={{ showToast, deleted, success, error, info, confirmDelete }}>
      {children}

      {/* Floating Glass Toasts Container */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none max-w-sm w-[calc(100vw-2.5rem)] sm:w-96">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.9, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, scale: 0.92, filter: "blur(6px)" }}
              transition={{ type: "spring", damping: 25, stiffness: 380 }}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 border backdrop-blur-2xl transition-all select-none ${
                toast.type === "delete"
                  ? "bg-gradient-to-b from-[#1c0d12]/92 to-[#0a0507]/96 border-rose-500/35 shadow-[0_20px_50px_rgba(225,29,72,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.4)]"
                  : toast.type === "success"
                  ? "bg-gradient-to-b from-[#0d1f14]/92 to-[#040d07]/96 border-emerald-500/35 shadow-[0_20px_50px_rgba(34,197,94,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.4)]"
                  : toast.type === "error"
                  ? "bg-gradient-to-b from-[#220d0d]/92 to-[#0e0404]/96 border-red-500/35 shadow-[0_20px_50px_rgba(239,68,68,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.4)]"
                  : "bg-gradient-to-b from-[#0e1726]/92 to-[#050a12]/96 border-sky-500/35 shadow-[0_20px_50px_rgba(56,189,248,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.4)]"
              }`}
            >
              {/* Specular Catch Light Reflection Line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

              <div className="flex items-start gap-3">
                {/* Glowing Glass Icon Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border backdrop-blur-md shadow-inner ${
                    toast.type === "delete"
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                      : toast.type === "success"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      : toast.type === "error"
                      ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : "bg-sky-500/20 border-sky-500/40 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                  }`}
                >
                  {toast.type === "delete" && <Trash2 className="w-4 h-4 animate-pulse" />}
                  {toast.type === "success" && <CheckCircle2 className="w-4 h-4" />}
                  {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
                  {toast.type === "info" && <Info className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white font-mono tracking-tight truncate">
                      {toast.title}
                    </h4>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider shrink-0">
                      CMS Alert
                    </span>
                  </div>
                  {toast.message && (
                    <p className="text-[11px] text-zinc-300 font-sans mt-0.5 leading-relaxed break-words">
                      {toast.message}
                    </p>
                  )}
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress drainage bar */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-[2px] ${
                  toast.type === "delete"
                    ? "bg-gradient-to-r from-rose-500 to-rose-400"
                    : toast.type === "success"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : toast.type === "error"
                    ? "bg-gradient-to-r from-red-500 to-red-400"
                    : "bg-gradient-to-r from-sky-500 to-sky-400"
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Glass Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", damping: 26, stiffness: 380 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl p-6 bg-gradient-to-b from-[#141b2d]/95 to-[#080d1a]/98 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_1.5px_rgba(255,255,255,0.35)] backdrop-blur-2xl text-[#fafafa] flex flex-col items-center text-center"
            >
              {/* Top catch light */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* Glowing Trash Badge */}
              <div className="w-13 h-13 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                <Trash2 className="w-6 h-6" />
              </div>

              {/* Title */}
              <h3 className="text-base font-bold font-mono text-white tracking-tight mb-1.5">
                {confirmDialog.title || "Confirm Delete"}
              </h3>

              {/* Message */}
              <p className="text-xs text-zinc-300 leading-relaxed mb-6 font-sans">
                {confirmDialog.message}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full font-mono text-xs">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-2.5 px-4 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-all font-semibold cursor-pointer active:scale-95"
                >
                  {confirmDialog.cancelLabel || "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-600/30 border border-rose-400/40 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{confirmDialog.confirmLabel || "Delete"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassToastContext.Provider>
  );
}
