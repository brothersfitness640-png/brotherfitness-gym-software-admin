"use client";

import { ReactNode } from "react";
import { Plus, Download, Upload, MoreHorizontal } from "lucide-react";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
  children?: ReactNode;
}

export default function PageContainer({
  title,
  subtitle = "Manage your gym data and track operations",
  actionText = `Add ${title.endsWith("s") ? title.slice(0, -1) : title}`,
  children,
}: PageContainerProps) {
  return (
    <div className="flex flex-col gap-5 p-5 md:p-7 max-w-7xl mx-auto w-full">
      {/* Top Page Header bar matching Shopify Reference UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button className="flex h-8.5 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span>Export</span>
          </button>
          <button className="flex h-8.5 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
            <Upload className="h-3.5 w-3.5 text-zinc-500" />
            <span>Import</span>
          </button>
          <button className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {/* Primary Action Button (Logo Yellow instead of black) */}
          <button className="flex h-8.5 items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 text-xs font-semibold text-black shadow-xs hover:bg-amber-500 active:scale-95 transition-all">
            <Plus className="h-4 w-4 stroke-[2]" />
            <span>{actionText}</span>
          </button>
        </div>
      </div>

      {/* Main Body Content or Empty Scaffold Container */}
      {children ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/30 min-h-[360px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-600 dark:text-amber-400 mb-3">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title} Page Ready
          </h3>
          <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
            This section is currently setup as a clean scaffold. Features and data table components can be added one by one.
          </p>
          <button className="flex h-7.5 items-center gap-1.5 rounded-md bg-amber-400 px-3.5 text-xs font-semibold text-black shadow-xs hover:bg-amber-500 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Configure {title}</span>
          </button>
        </div>
      )}
    </div>
  );
}
