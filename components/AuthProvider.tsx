"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

export interface StaffUser {
  id: string;
  name: string;
  mobile: string;
  photoUrl?: string;
  assignedOutlets: string[];
  permissions: Record<string, "view" | "edit" | "none">;
}

interface AuthContextType {
  user: User | null;
  staffUser: StaffUser | null;
  role: "admin" | "staff" | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginAsStaff: (staff: StaffUser) => void;
  hasAccess: (path: string) => boolean;
  canEdit: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  staffUser: null,
  role: null,
  loading: true,
  logout: async () => {},
  loginAsStaff: () => {},
  hasAccess: () => false,
  canEdit: () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load staff session from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("brothers_fitness_staff_session");
      if (stored) {
        setStaffUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load staff session:", e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const role: "admin" | "staff" | null = user ? "admin" : staffUser ? "staff" : null;

  const hasAccess = (path: string): boolean => {
    if (user) return true; // Full admin access
    if (!staffUser) return false;

    // Normalize path to base module
    const cleanPath = path === "" ? "/" : path;
    const baseSegment = "/" + cleanPath.split("/")[1] || "/";

    // Direct match or base segment match
    const perm = staffUser.permissions[cleanPath] || staffUser.permissions[baseSegment];
    return perm === "view" || perm === "edit";
  };

  const canEdit = (path: string): boolean => {
    if (user) return true;
    if (!staffUser) return false;

    const cleanPath = path === "" ? "/" : path;
    const baseSegment = "/" + cleanPath.split("/")[1] || "/";
    const perm = staffUser.permissions[cleanPath] || staffUser.permissions[baseSegment];
    return perm === "edit";
  };

  const loginAsStaff = (staff: StaffUser) => {
    setStaffUser(staff);
    localStorage.setItem("brothers_fitness_staff_session", JSON.stringify(staff));
    
    // Redirect to first available page
    const allowed = Object.entries(staff.permissions)
      .filter(([_, p]) => p === "view" || p === "edit")
      .map(([href]) => href);

    if (allowed.includes("/") || allowed.includes("/dashboard")) {
      router.replace("/");
    } else if (allowed.length > 0) {
      router.replace(allowed[0]);
    } else {
      router.replace("/");
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("brothers_fitness_staff_session");
      setStaffUser(null);
      if (user) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.replace("/login");
    }
  };

  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === "/login";
      const isAuthenticated = !!user || !!staffUser;

      if (!isAuthenticated && !isLoginPage) {
        router.replace("/login");
      } else if (isAuthenticated && isLoginPage) {
        router.replace("/");
      }
    }
  }, [user, staffUser, loading, pathname, router]);

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

  // If not logged in and not on login page
  if (!user && !staffUser && pathname !== "/login") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Redirecting to Login...</span>
        </div>
      </div>
    );
  }

  // If staff user is logged in, verify if current pathname is allowed
  if (staffUser && !user && pathname !== "/login" && !hasAccess(pathname)) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Your staff account does not have permission to view this section. Please contact your Gym Administrator for access.
        </p>
        <button
          onClick={() => {
            const allowed = Object.entries(staffUser.permissions)
              .filter(([_, p]) => p === "view" || p === "edit")
              .map(([href]) => href);
            if (allowed.length > 0) router.replace(allowed[0]);
            else logout();
          }}
          className="cursor-pointer mt-5 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-500"
        >
          Go to Permitted Page
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        staffUser,
        role,
        loading,
        logout,
        loginAsStaff,
        hasAccess,
        canEdit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
