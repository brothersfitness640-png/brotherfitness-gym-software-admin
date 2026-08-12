import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ToastProvider } from "@/components/ToastProvider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Brother's Fitness | Admin Portal",
  description: "Brother's Fitness Gym Management System Admin Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} h-full antialiased`}
    >
      <body className={`${sora.className} min-h-full flex bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans pb-16 lg:pb-0`}>
        <ToastProvider>
          <Sidebar />
          <div className="flex flex-1 flex-col lg:pl-60 min-h-screen">
            <Header />
            <main className="flex-1 bg-zinc-50/50 dark:bg-zinc-950 pb-6">
              {children}
            </main>
          </div>
          <MobileBottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
