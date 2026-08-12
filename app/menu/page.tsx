"use client";

import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import {
  Building2,
  Layers,
  Package,
  UserCheck,
  BadgeIndianRupee,
  Users,
  UserPlus,
  CalendarCheck,
  HelpCircle,
  Settings,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Activity,
  Globe,
} from "lucide-react";

const MENU_CARDS = [
  {
    title: "Gym Outlets",
    subtitle: "Branches, GPS location & setup",
    href: "/outlets",
    icon: Building2,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    title: "Clients Directory",
    subtitle: "Members, plans & renewals",
    href: "/clients",
    icon: Users,
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  {
    title: "Visitors & Inquiries",
    subtitle: "Follow-up leads & responses",
    href: "/visitors",
    icon: UserPlus,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    title: "Client Attendance",
    subtitle: "Check-in logs & security scan",
    href: "/client-attendance",
    icon: CalendarCheck,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    title: "Membership Plans",
    subtitle: "Pricing, months & fee structure",
    href: "/plans",
    icon: Layers,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    title: "Products & Store",
    subtitle: "Supplements, stock & sales",
    href: "/products",
    icon: Package,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  {
    title: "Staff Members",
    subtitle: "Trainers, instructors & attendance",
    href: "/staff",
    icon: UserCheck,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    title: "Payroll & Salaries",
    subtitle: "Advances, leaves & payslips",
    href: "/payroll",
    icon: BadgeIndianRupee,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    title: "Support & Contact",
    subtitle: "GamaNext technical assistance",
    href: "/support",
    icon: HelpCircle,
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  {
    title: "System Settings",
    subtitle: "Logo upload & config options",
    href: "/settings",
    icon: Settings,
    color: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
  },
];

export default function MobileMenuPage() {
  return (
    <PageContainer
      title="Mobile Admin Menu"
      subtitle="Complete profile & navigation hub for Brother's Fitness operations"
    >
      {/* Profile & Gym Account Header Card */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-lg font-bold text-black ring-4 ring-amber-400/20 shadow-md">
            BF
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-zinc-900">
              <ShieldCheck className="h-3 w-3" />
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                Brother's Fitness
              </h2>
              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-400/30">
                PRO ADMIN
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Gym Management System & Admin Portal
            </p>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Network Active
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">• 1.0.0 Pro</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD BASIS MENU ITEMS GRID */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {MENU_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-400/60 transition-all duration-200 active:scale-98"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${card.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-5.5 w-5.5" />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                    {card.title}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                    {card.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-amber-400 group-hover:text-black transition-colors text-zinc-400 ml-2">
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* FOOTER AGENCY & SOFTWARE INFO CARD */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-100/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-semibold">
          <Globe className="h-4 w-4 text-amber-500" />
          <span>Developed & Maintained by <strong className="text-zinc-900 dark:text-zinc-100">GamaNext Software Solutions</strong></span>
        </div>

        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span>Contact Technical Support</span>
        </Link>
      </div>
    </PageContainer>
  );
}
