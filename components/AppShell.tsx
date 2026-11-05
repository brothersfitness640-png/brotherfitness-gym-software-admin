"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, staffUser, role } = useAuth();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const isAuthenticated = !!user || !!staffUser || !!role;

  // Hide application navigation shell on login page or when not authenticated
  if (!isAuthenticated || isLoginPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col lg:pl-60 min-h-screen print:pl-0 print:m-0 print:p-0 print:w-full print:min-h-0">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 bg-zinc-50/50 dark:bg-zinc-950 pb-6 print:bg-white print:p-0 print:m-0 print:pb-0">
          {children}
        </main>
      </div>
      <div className="print:hidden">
        <MobileBottomNav />
      </div>
    </>
  );
}
