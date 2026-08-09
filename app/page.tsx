import PageContainer from "@/components/PageContainer";
import { Users, CalendarCheck, Package, TrendingUp, Filter } from "lucide-react";

export default function DashboardPage() {
  return (
    <PageContainer
      title="Dashboard"
      subtitle="Overview of Brother's Fitness operations, memberships, and activity"
      actionText="New Registration"
    >
      {/* Top Stat Summary Cards matching Shopify reference UI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Active Clients
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              --
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="mr-1 h-3 w-3" />
              Active
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Today's Attendance
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              --
            </span>
            <span className="text-xs font-medium text-zinc-400">
              Check-ins
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Products & Supplements
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              --
            </span>
            <span className="text-xs font-medium text-zinc-400">
              In Stock
            </span>
          </div>
        </div>
      </div>

      {/* Content Table / Empty State Container */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button className="rounded-lg bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-400/30">
              All Overview
            </button>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            <Filter className="h-3.5 w-3.5" />
            <span>Search and filter</span>
          </button>
        </div>

        {/* Empty Scaffold Body */}
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-400/30">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Dashboard Workspace Empty
          </h3>
          <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Dashboard charts and recent gym activity logs will be displayed here as modules are built out.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
