import PageContainer from "@/components/PageContainer";
import { CalendarCheck, Clock, CheckCircle2, Search, Filter } from "lucide-react";

export default function ClientAttendancePage() {
  return (
    <PageContainer
      title="Client Attendance"
      subtitle="Track daily member check-ins, time slots, and attendance logs"
      actionText="Check-in Member"
    >
      {/* Top Stat Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Today's Total Check-ins
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              0
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Today
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Currently in Gym
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              0
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Active Session
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Monthly Attendance
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              0
            </span>
            <span className="text-xs font-medium text-zinc-400">This Month</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 px-5 py-3 gap-3 dark:border-zinc-800">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black shadow-sm">
              Today's Logs
            </button>
            <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
              Morning Shift
            </button>
            <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
              Evening Shift
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search member..."
                className="h-8 w-48 rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-medium outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:focus:border-amber-400"
              />
            </div>
            <button className="flex h-8 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
              <Filter className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Empty Table Scaffold Body */}
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-400/30">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            No Attendance Logs Today
          </h3>
          <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
            Log check-ins for members entering Brother's Fitness gym.
          </p>
          <button className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-500 transition-colors">
            + Check-in Member
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
