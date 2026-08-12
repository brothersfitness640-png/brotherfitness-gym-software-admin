"use client";

import { ReactNode } from "react";
import { Plus, Download, Upload, MoreHorizontal } from "lucide-react";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
  showExportImport?: boolean;
  onExport?: () => void;
  onImport?: () => void;
  children?: ReactNode;
}

export default function PageContainer({
  title,
  subtitle = "Manage your gym data and track operations",
  actionText,
  onActionClick,
  showExportImport = false,
  onExport,
  onImport,
  children,
}: PageContainerProps) {
  const hasActions = Boolean(actionText || onActionClick || showExportImport);

  return (
    <div className="flex flex-col gap-5 p-5 md:p-7 max-w-7xl mx-auto w-full">
      {/* Top Page Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons Toolbar - Only shown when actions are specified */}
        {hasActions && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {showExportImport && (
              <>
                <button
                  onClick={onExport}
                  className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Export</span>
                </button>
                <button
                  onClick={onImport}
                  className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Import</span>
                </button>
              </>
            )}

            {(actionText || onActionClick) && (
              <button
                onClick={onActionClick}
                className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 text-xs font-semibold text-black shadow-xs hover:bg-amber-500 active:scale-95 transition-all"
              >
                {!actionText?.startsWith("+") && !actionText?.includes("Refresh") && (
                  <Plus className="h-4 w-4 stroke-[2]" />
                )}
                <span>{actionText || "Action"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Body Content */}
      {children}
    </div>
  );
}
