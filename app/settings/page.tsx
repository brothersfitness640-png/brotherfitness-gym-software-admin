import PageContainer from "@/components/PageContainer";
import { Settings, Sliders, Bell, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      subtitle="Configure Brother's Fitness gym preferences, plans, and system parameters"
      actionText="Save Settings"
    >
      {/* Settings Navigation Tabs & Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* General Gym Profile */}
        <div className="cursor-pointer hover:border-amber-400/50 transition-colors rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Gym Profile
              </h3>
              <p className="text-[11px] text-zinc-500">Name, Logo & Operating Hours</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Customize Brother's Fitness details, contact information, and business hours.
          </p>
        </div>

        {/* Membership Plans & Pricing */}
        <div className="cursor-pointer hover:border-amber-400/50 transition-colors rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Membership Packages
              </h3>
              <p className="text-[11px] text-zinc-500">Plans, Fees & Renewals</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Define monthly, quarterly, and annual gym membership packages and rules.
          </p>
        </div>

        {/* Notifications & Security */}
        <div className="cursor-pointer hover:border-amber-400/50 transition-colors rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Alerts & Security
              </h3>
              <p className="text-[11px] text-zinc-500">SMS Reminders & Roles</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Configure automated membership expiry SMS alerts and admin access permissions.
          </p>
        </div>
      </div>

      {/* Main Settings Scaffold Container */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 p-8">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-400/30">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Settings Workspace Ready
          </h3>
          <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
            System options, payment gateway setup, and gym preferences will be populated here.
          </p>
          <button className="cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-500 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
