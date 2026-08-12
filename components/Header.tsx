"use client";

import { Search, Bell, Eye, Command, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/95 px-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      {/* Search Bar matching reference image */}
      <div className="flex flex-1 items-center max-w-sm sm:max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search clients, products, staff..."
            className="h-8.5 w-full rounded-lg border border-zinc-200 bg-zinc-100/70 pl-9 pr-12 text-xs font-medium text-zinc-900 placeholder-zinc-500 outline-none transition-colors focus:border-amber-400 focus:bg-white focus:ring-1 focus:ring-amber-400/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-amber-400"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded bg-zinc-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Notifications Button */}
        <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-950" />
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-2.5 border-l border-zinc-200 dark:border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-xs font-semibold text-black ring-1 ring-amber-400/40">
            BF
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
              Brother's Fitness
            </span>
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-zinc-800 transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
