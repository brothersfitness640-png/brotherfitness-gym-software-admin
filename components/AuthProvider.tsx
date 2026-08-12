"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === "/login";
      if (!user && !isLoginPage) {
        router.replace("/login");
      } else if (user && isLoginPage) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20">
            <img src="/app-icon.png" alt="Brothers Fitness" className="h-full w-full rounded-2xl object-cover" />
          </div>
          <div className="flex items-center gap-2 mt-4 text-amber-400 font-semibold text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying Credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in and trying to access protected page, render loader while redirecting
  if (!user && pathname !== "/login") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Redirecting to Login...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
