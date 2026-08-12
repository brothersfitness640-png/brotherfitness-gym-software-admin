import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthProvider } from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";
import RegisterSW from "@/components/RegisterSW";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Brothers Fitness | Gym Software Admin",
  description: "Brothers Fitness Gym Management System Admin Portal",
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brothers Fitness",
  },
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
          <AuthProvider>
            <RegisterSW />
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
