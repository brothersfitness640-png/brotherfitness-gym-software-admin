"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  // Hide application navigation shell on login page or when not authenticated
  if (!user || isLoginPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <div className="flex flex-1 flex-col lg:pl-60 min-h-screen">
        <Header />
        <main className="flex-1 bg-zinc-50/50 dark:bg-zinc-950 pb-6">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </>
  );
}
