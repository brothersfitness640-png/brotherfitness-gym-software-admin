"use client";

import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  loading = false,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-150">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mb-3 border border-red-200 dark:border-red-900/50 shadow-xs">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>

          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1.5 mb-5">
            {message}
          </p>

          <div className="flex items-center gap-2.5 w-full">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 rounded-lg border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
