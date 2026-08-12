"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  Grid,
} from "lucide-react";

const bottomNavItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
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
    name: "Attendance",
    href: "/client-attendance",
    icon: CalendarCheck,
  },
  {
    name: "Menu",
    href: "/menu",
    icon: Grid,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/95 px-2 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 lg:hidden shadow-lg">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-bold transition-all duration-150 active:scale-95 ${
              isActive
                ? "text-amber-600 dark:text-amber-400"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <div
              className={`relative flex items-center justify-center rounded-xl p-1.5 transition-all ${
                isActive
                  ? "bg-amber-400/20 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300"
                  : ""
              }`}
            >
              <Icon className="h-5 w-5" />
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber-500" />
              )}
            </div>
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
