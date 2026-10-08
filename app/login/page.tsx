"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Download,
  Loader2,
  CheckCircle2,
  Building2,
  ShieldCheck,
  UserCheck,
  Phone,
  KeyRound,
  Shield,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsStaff } = useAuth();

  // Mode: "admin" | "staff"
  const [loginMode, setLoginMode] = useState<"admin" | "staff">("admin");

  // Admin Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Staff Credentials
  const [mobile, setMobile] = useState("");
  const [mpin, setMpin] = useState("");
  const [showMpin, setShowMpin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email address and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      let errMsg = "Invalid email or password. Please check your credentials.";
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        errMsg = "Invalid email address or password.";
      } else if (err.code === "auth/too-many-requests") {
        errMsg = "Too many failed attempts. Please try again later.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.trim().replace(/\D/g, "");
    const cleanMpin = mpin.trim();

    if (!cleanMobile || cleanMobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!cleanMpin) {
      setError("Please enter your MPIN.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query portal_staff collection
      const q = query(
        collection(db, "portal_staff"),
        where("mobile", "==", cleanMobile)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError(
          "Staff member not registered with this mobile number. Please contact Gym Admin."
        );
        setLoading(false);
        return;
      }

      const staffDoc = snapshot.docs[0];
      const staffData = staffDoc.data();

      // Check MPIN
      if (staffData.mpin !== cleanMpin) {
        setError("Invalid MPIN! Please enter the correct PIN provided by Admin.");
        setLoading(false);
        return;
      }

      // Successful staff login!
      loginAsStaff({
        id: staffDoc.id,
        name: staffData.name || "Staff Member",
        mobile: staffData.mobile,
        photoUrl: staffData.photoUrl,
        assignedOutlets: staffData.assignedOutlets || [],
        permissions: staffData.permissions || {},
      });
    } catch (err: any) {
      console.error("Staff Login Error:", err);
      setError("Failed to verify staff login. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert(
        "App installation prompt ready. Tap your browser menu and select 'Add to Home Screen' or 'Install App'."
      );
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-100 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
      {/* Main Login Card matching App Design System */}
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-black p-1 shadow-sm border border-amber-400/40 mb-3">
            <img
              src="/app-icon.png"
              alt="Brothers Fitness Logo"
              className="h-full w-full object-cover rounded-xl"
            />
          </div>

          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Brothers Fitness
          </h1>
          <span className="mt-1 inline-flex items-center gap-1 rounded bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-400/30">
            <ShieldCheck className="h-3 w-3" />
            {loginMode === "admin" ? "Gym Admin Portal" : "Staff Member Access"}
          </span>
        </div>

        {/* Login Mode Toggle Tabs */}
        <div className="mt-4 grid grid-cols-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => {
              setLoginMode("admin");
              setError(null);
            }}
            className={`cursor-pointer flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              loginMode === "admin"
                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            <span>Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode("staff");
              setError(null);
            }}
            className={`cursor-pointer flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              loginMode === "staff"
                ? "bg-amber-400 text-black shadow-xs font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Staff Login</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Form: Admin Login */}
        {loginMode === "admin" && (
          <form onSubmit={handleAdminLogin} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Admin Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@brothersfitness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Admin Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-9 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-black shadow-xs hover:bg-amber-500 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Signing In Admin...</span>
                </>
              ) : (
                <span>Sign In To Admin Portal</span>
              )}
            </button>
          </form>
        )}

        {/* Form: Staff Login (Mobile + MPIN) */}
        {loginMode === "staff" && (
          <form onSubmit={handleStaffLogin} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Staff Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400 tracking-wider font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Staff Security MPIN *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showMpin ? "text" : "password"}
                  maxLength={6}
                  required
                  placeholder="Enter 4-6 digit MPIN"
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-9 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400 tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowMpin(!showMpin)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showMpin ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Enter your designated staff MPIN provided by management.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-4 text-xs font-bold text-black shadow-xs hover:bg-amber-500 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying Staff MPIN...</span>
                </>
              ) : (
                <span>Sign In As Staff</span>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="my-5 flex items-center gap-2">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Brothers Fitness PWA
          </span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* PWA Install App Button */}
        <div>
          {isInstalled ? (
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 px-3 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Brothers Fitness App Installed</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstallApp}
              className="cursor-pointer flex h-8.5 w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-amber-500" />
              <span>Install Brothers Fitness App</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-6 text-center text-[11px] font-medium text-zinc-500">
        GamaNext Gym Software Engine • v2.0
      </div>
    </div>
  );
}
