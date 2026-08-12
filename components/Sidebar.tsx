"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Package,
  UserCheck,
  BadgeIndianRupee,
  Settings,
  Layers,
  Building2,
  UserPlus,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Outlets",
    href: "/outlets",
    icon: Building2,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Visitors",
    href: "/visitors",
    icon: UserPlus,
  },
  {
    name: "Client Attendance",
    href: "/client-attendance",
    icon: CalendarCheck,
  },
  {
    name: "Plans",
    href: "/plans",
    icon: Layers,
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
  },
  {
    name: "Staff",
    href: "/staff",
    icon: UserCheck,
  },
  {
    name: "Payroll",
    href: "/payroll",
    icon: BadgeIndianRupee,
  },
  {
    name: "Support & Contact",
    href: "/support",
    icon: HelpCircle,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden lg:flex w-60 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Gym Brand / Logo Header */}
      <div className="flex h-14 items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden border border-amber-400 bg-black shadow-xs">
          <Image
            src="/logo.png"
            alt="Brother's Fitness Logo"
            width={32}
            height={32}
            className="object-contain p-0.5"
            priority
          />
        </div>
        <div className="flex flex-col truncate">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Brother's Fitness
            </span>
            <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-400/30">
              Pro
            </span>
          </div>
          <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
            Gym Admin
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1 px-2.5 py-3 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Navigation
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-amber-400 text-black shadow-xs font-semibold"
                  : "text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive
                    ? "text-black"
                    : "text-zinc-500 group-hover:text-amber-500 dark:text-zinc-400"
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="cursor-pointer group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-zinc-800 transition-colors mt-2"
        >
          <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </nav>

      {/* Footer Branding Info */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex items-center justify-between rounded-lg bg-amber-400/10 px-3 py-2 border border-amber-400/20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              System Active
            </span>
          </div>
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
            v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
