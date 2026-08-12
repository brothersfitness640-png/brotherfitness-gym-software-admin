"use client";

import { useState, useEffect, useMemo } from "react";
import PageContainer from "@/components/PageContainer";
import { db } from "@/lib/firebase";
import {
  collection,
  collectionGroup,
  onSnapshot,
} from "firebase/firestore";
import {
  Users,
  UserCheck,
  UserX,
  CreditCard,
  Wallet,
  Banknote,
  QrCode,
  TrendingUp,
  CalendarCheck,
  Package,
  Building2,
  Filter,
  CheckCircle2,
  Clock,
  PieChart,
  BarChart3,
  RefreshCw,
  DollarSign,
  Activity,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  User,
  Calendar,
} from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";


// Interfaces for Firestore Collections
interface ClientMember {
  id: string;
  name: string;
  mobile: string;
  outletId?: string;
  outletName?: string;
  status?: string;
  createdAt?: any;
}

interface StaffMember {
  id: string;
  name: string;
  role?: string;
  mobile?: string;
  outletId?: string;
  outletName?: string;
  status?: string;
}

interface GymOutlet {
  id: string;
  name: string;
  address?: string;
}

interface PaymentRecord {
  id: string;
  type: "client_plan" | "client_product" | "staff_advance" | "staff_advance_installment";
  memberName: string;
  memberId?: string;
  outletId?: string;
  amount: number;
  mode: string; // Cash, UPI, Card, Net Banking, etc.
  status: string; // Paid, Pending
  date: string; // YYYY-MM-DD
  createdAt?: any;
}

interface AttendanceEntry {
  id: string;
  type: "client" | "staff";
  memberId: string;
  memberName?: string;
  date: string; // YYYY-MM-DD
  inTime?: string;
  status: string;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientMember[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [outlets, setOutlets] = useState<GymOutlet[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceEntry[]>([]);

  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<
    "today" | "this_week" | "this_month" | "this_year" | "all_time" | "custom"
  >("today");
  
  // Custom Date Range State
  const [customFromDate, setCustomFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [customToDate, setCustomToDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [activeTab, setActiveTab] = useState<"payments" | "attendance">("payments");

  // Date Calculation Helpers
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const currentYearStr = useMemo(() => new Date().getFullYear().toString(), []);

  // Compute Monday of Current Week
  const currentWeekStartStr = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday as week start
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  }, []);

  // 1. Listen to Clients, Staff, Outlets
  useEffect(() => {
    const clientsUnsub = onSnapshot(collection(db, "clients"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClientMember[];
      setClients(list);
    });

    const staffUnsub = onSnapshot(collection(db, "staff"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StaffMember[];
      setStaffList(list);
    });

    const outletsUnsub = onSnapshot(collection(db, "outlets"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GymOutlet[];
      setOutlets(list);
    });

    return () => {
      clientsUnsub();
      staffUnsub();
      outletsUnsub();
    };
  }, []);

  // 2. Listen to Payments (Client Plan Installments, Product Installments, Staff Advances & Installments)
  useEffect(() => {
    const paymentRecords: Map<string, PaymentRecord> = new Map();

    const updateCombinedPayments = () => {
      setAllPayments(Array.from(paymentRecords.values()));
      setLoading(false);
    };

    // Client Plan Installments
    const planInstUnsub = onSnapshot(
      collectionGroup(db, "installments"),
      (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const recordId = `plan_inst_${doc.id}`;
          paymentRecords.set(recordId, {
            id: doc.id,
            type: "client_plan",
            memberName: data.clientName || data.name || "Client Member",
            memberId: data.clientId || doc.ref.parent.parent?.id,
            amount: Number(data.amount) || 0,
            mode: data.mode || "Cash",
            status: data.status || "Paid",
            date: data.date || todayStr,
            createdAt: data.createdAt,
          });
        });
        updateCombinedPayments();
      },
      (err) => console.warn("Plan installments group query listener:", err)
    );

    // Client Product Installments
    const prodInstUnsub = onSnapshot(
      collectionGroup(db, "product_installments"),
      (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const recordId = `prod_inst_${doc.id}`;
          paymentRecords.set(recordId, {
            id: doc.id,
            type: "client_product",
            memberName: data.clientName || data.name || "Client Store Purchase",
            memberId: data.clientId || doc.ref.parent.parent?.id,
            amount: Number(data.amount) || 0,
            mode: data.mode || "Cash",
            status: data.status || "Paid",
            date: data.date || todayStr,
            createdAt: data.createdAt,
          });
        });
        updateCombinedPayments();
      },
      (err) => console.warn("Product installments group query listener:", err)
    );

    // Staff Advances
    const advancesUnsub = onSnapshot(
      collectionGroup(db, "advances"),
      (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const recordId = `staff_adv_${doc.id}`;
          paymentRecords.set(recordId, {
            id: doc.id,
            type: "staff_advance",
            memberName: data.staffName || data.title || "Staff Advance",
            memberId: data.staffId || doc.ref.parent.parent?.id,
            amount: Number(data.amount) || 0,
            mode: data.mode || "Cash",
            status: "Paid",
            date: data.date || todayStr,
            createdAt: data.createdAt,
          });
        });
        updateCombinedPayments();
      },
      (err) => console.warn("Staff advances group query listener:", err)
    );

    // Staff Advance Installments
    const advInstUnsub = onSnapshot(
      collectionGroup(db, "advance_installments"),
      (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const recordId = `staff_adv_inst_${doc.id}`;
          paymentRecords.set(recordId, {
            id: doc.id,
            type: "staff_advance_installment",
            memberName: data.staffName || data.name || "Staff Advance Settlement",
            memberId: data.staffId || doc.ref.parent.parent?.id,
            amount: Number(data.amount) || 0,
            mode: data.mode || "Cash",
            status: data.status || "Paid",
            date: data.date || todayStr,
            createdAt: data.createdAt,
          });
        });
        updateCombinedPayments();
      },
      (err) => console.warn("Staff advance installments group query listener:", err)
    );

    return () => {
      planInstUnsub();
      prodInstUnsub();
      advancesUnsub();
      advInstUnsub();
    };
  }, [todayStr]);

  // 3. Listen to Attendance Logs across clients & staff
  useEffect(() => {
    const attendanceUnsub = onSnapshot(
      collectionGroup(db, "attendance"),
      (snapshot) => {
        const list: AttendanceEntry[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const parentCollection = doc.ref.parent.parent?.parent?.id; // "clients" or "staff"
          const memberId = doc.ref.parent.parent?.id || "";

          return {
            id: doc.id,
            type: parentCollection === "staff" ? "staff" : "client",
            memberId: data.clientId || data.staffId || memberId,
            memberName: data.clientName || data.staffName || data.name || "Member",
            date: data.date || todayStr,
            inTime: data.inTime || "--:--",
            status: data.status || "Present",
          };
        });
        setAttendanceLogs(list);
      },
      (err) => console.warn("Attendance group query listener:", err)
    );

    return () => attendanceUnsub();
  }, [todayStr]);

  // Map Client/Staff IDs to their Outlet IDs for Outlet Filter
  const clientOutletMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c) => {
      if (c.outletId) map.set(c.id, c.outletId);
    });
    return map;
  }, [clients]);

  const staffOutletMap = useMemo(() => {
    const map = new Map<string, string>();
    staffList.forEach((s) => {
      if (s.outletId) map.set(s.id, s.outletId);
    });
    return map;
  }, [staffList]);

  // Filtered Clients & Staff by Outlet
  const filteredClients = useMemo(() => {
    if (selectedOutlet === "all") return clients;
    return clients.filter((c) => c.outletId === selectedOutlet);
  }, [clients, selectedOutlet]);

  const filteredStaff = useMemo(() => {
    if (selectedOutlet === "all") return staffList;
    return staffList.filter((s) => s.outletId === selectedOutlet);
  }, [staffList, selectedOutlet]);

  // Filter Payments by Outlet & Expanded Date Filters
  const filteredPayments = useMemo(() => {
    return allPayments.filter((p) => {
      // Status must be Paid
      if (p.status !== "Paid") return false;

      // Expanded Date Filtering
      if (dateFilter === "today" && p.date !== todayStr) return false;
      if (
        dateFilter === "this_week" &&
        (p.date < currentWeekStartStr || p.date > todayStr)
      )
        return false;
      if (dateFilter === "this_month" && !p.date.startsWith(currentMonthStr))
        return false;
      if (dateFilter === "this_year" && !p.date.startsWith(currentYearStr))
        return false;
      if (dateFilter === "custom") {
        if (customFromDate && p.date < customFromDate) return false;
        if (customToDate && p.date > customToDate) return false;
      }

      // Outlet Filter
      if (selectedOutlet !== "all") {
        if (p.outletId && p.outletId !== selectedOutlet) return false;
        if (p.memberId) {
          const clientOutlet = clientOutletMap.get(p.memberId);
          const staffOutlet = staffOutletMap.get(p.memberId);
          if (clientOutlet && clientOutlet !== selectedOutlet) return false;
          if (staffOutlet && staffOutlet !== selectedOutlet) return false;
        }
      }

      return true;
    });
  }, [
    allPayments,
    dateFilter,
    todayStr,
    currentWeekStartStr,
    currentMonthStr,
    currentYearStr,
    customFromDate,
    customToDate,
    selectedOutlet,
    clientOutletMap,
    staffOutletMap,
  ]);

  // Payment Mode Aggregations
  const paymentStats = useMemo(() => {
    let totalCollected = 0;
    let upiTotal = 0;
    let cardTotal = 0;
    let cashTotal = 0;
    let otherTotal = 0;

    let clientPlanTotal = 0;
    let clientProductTotal = 0;
    let staffAdvanceTotal = 0;

    filteredPayments.forEach((p) => {
      const amt = p.amount || 0;
      totalCollected += amt;

      // Source categorization
      if (p.type === "client_plan") clientPlanTotal += amt;
      else if (p.type === "client_product") clientProductTotal += amt;
      else if (p.type === "staff_advance" || p.type === "staff_advance_installment") staffAdvanceTotal += amt;

      // Payment Mode categorization
      const modeLower = (p.mode || "").toLowerCase().trim();
      if (
        modeLower.includes("upi") ||
        modeLower.includes("gpay") ||
        modeLower.includes("phonepe") ||
        modeLower.includes("paytm") ||
        modeLower.includes("qr") ||
        modeLower.includes("online")
      ) {
        upiTotal += amt;
      } else if (
        modeLower.includes("card") ||
        modeLower.includes("debit") ||
        modeLower.includes("credit") ||
        modeLower.includes("pos")
      ) {
        cardTotal += amt;
      } else if (modeLower.includes("cash")) {
        cashTotal += amt;
      } else {
        otherTotal += amt;
      }
    });

    const upiPercent = totalCollected > 0 ? Math.round((upiTotal / totalCollected) * 100) : 0;
    const cardPercent = totalCollected > 0 ? Math.round((cardTotal / totalCollected) * 100) : 0;
    const cashPercent = totalCollected > 0 ? Math.round((cashTotal / totalCollected) * 100) : 0;
    const otherPercent = totalCollected > 0 ? Math.round((otherTotal / totalCollected) * 100) : 0;

    return {
      totalCollected,
      upiTotal,
      upiPercent,
      cardTotal,
      cardPercent,
      cashTotal,
      cashPercent,
      otherTotal,
      otherPercent,
      clientPlanTotal,
      clientProductTotal,
      staffAdvanceTotal,
      clientTotal: clientPlanTotal + clientProductTotal,
    };
  }, [filteredPayments]);

  // Attendance Stats for Today
  const attendanceStats = useMemo(() => {
    const todayLogs = attendanceLogs.filter((log) => log.date === todayStr);

    // Clients Present Today
    const presentClientIds = new Set<string>();
    todayLogs.forEach((log) => {
      if (log.type === "client" && log.status !== "Absent") {
        if (selectedOutlet === "all" || clientOutletMap.get(log.memberId) === selectedOutlet) {
          presentClientIds.add(log.memberId);
        }
      }
    });

    // Staff Present Today
    const presentStaffIds = new Set<string>();
    todayLogs.forEach((log) => {
      if (log.type === "staff" && log.status !== "Absent") {
        if (selectedOutlet === "all" || staffOutletMap.get(log.memberId) === selectedOutlet) {
          presentStaffIds.add(log.memberId);
        }
      }
    });

    const totalClientsCount = filteredClients.length;
    const presentClientsCount = Math.min(presentClientIds.size, totalClientsCount);
    const absentClientsCount = Math.max(0, totalClientsCount - presentClientsCount);

    const totalStaffCount = filteredStaff.length;
    const presentStaffCount = Math.min(presentStaffIds.size, totalStaffCount);
    const absentStaffCount = Math.max(0, totalStaffCount - presentStaffCount);

    const combinedTotal = totalClientsCount + totalStaffCount;
    const combinedPresent = presentClientsCount + presentStaffCount;
    const combinedAbsent = absentClientsCount + absentStaffCount;
    const overallRate = combinedTotal > 0 ? Math.round((combinedPresent / combinedTotal) * 100) : 0;

    return {
      totalClients: totalClientsCount,
      presentClients: presentClientsCount,
      absentClients: absentClientsCount,
      totalStaff: totalStaffCount,
      presentStaff: presentStaffCount,
      absentStaff: absentStaffCount,
      combinedTotal,
      combinedPresent,
      combinedAbsent,
      overallRate,
    };
  }, [attendanceLogs, todayStr, filteredClients, filteredStaff, selectedOutlet, clientOutletMap, staffOutletMap]);

  // Format INR currency
  const formatINR = (val: number) => {
    return "₹" + val.toLocaleString("en-IN");
  };

  return (
    <PageContainer
      title="Gym Operations & Financial Dashboard"
      subtitle="Live payment collections breakdown, member attendance analytics, and operational metrics"
    >
      {/* Filters & Control Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Brothers Fitness Overview
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Filter by branch or date range to update graphs and statistics
              </p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Outlet Filter */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
              <Building2 className="h-3.5 w-3.5 ml-2 text-zinc-500" />
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none pr-2 cursor-pointer py-1"
              >
                <option value="all" className="dark:bg-zinc-900">All Gym Outlets</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id} className="dark:bg-zinc-900">
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter Pills */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 overflow-x-auto">
              <button
                onClick={() => setDateFilter("today")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  dateFilter === "today"
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter("this_week")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  dateFilter === "this_week"
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateFilter("this_month")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  dateFilter === "this_month"
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateFilter("this_year")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  dateFilter === "this_year"
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                This Year
              </button>
              <button
                onClick={() => setDateFilter("all_time")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  dateFilter === "all_time"
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateFilter("custom")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  dateFilter === "custom"
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>
        </div>

        {/* Custom Date Range Row Picker */}
        {dateFilter === "custom" && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-amber-500/5 dark:bg-amber-400/5 p-3 rounded-xl border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span>Select Date Range:</span>
            </div>
            <div className="flex items-center gap-2 w-44">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">From:</span>
              <CustomDatePicker
                value={customFromDate}
                onChange={(val) => setCustomFromDate(val)}
                placeholder="From Date"
              />
            </div>
            <div className="flex items-center gap-2 w-44">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">To:</span>
              <CustomDatePicker
                value={customToDate}
                onChange={(val) => setCustomToDate(val)}
                placeholder="To Date"
              />
            </div>
          </div>
        )}
      </div>

      {/* TOP METRIC CARDS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* CARD 1: Total Collections & Payment Breakdown */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Total Collections
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {formatINR(paymentStats.totalCollected)}
              </span>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                From Clients & Staff (
                {dateFilter === "today"
                  ? "Today"
                  : dateFilter === "this_week"
                  ? "This Week"
                  : dateFilter === "this_month"
                  ? "This Month"
                  : dateFilter === "this_year"
                  ? "This Year"
                  : dateFilter === "custom"
                  ? `${customFromDate} to ${customToDate}`
                  : "All Time"}
                )
              </p>
            </div>
          </div>

          {/* Payment Mode Mini-Badges */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-1 text-center">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-1.5 border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                <QrCode className="h-3 w-3" /> UPI
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatINR(paymentStats.upiTotal)}
              </p>
            </div>

            <div className="rounded-lg bg-violet-50 dark:bg-violet-950/40 p-1.5 border border-violet-200/50 dark:border-violet-800/30">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-violet-700 dark:text-violet-400">
                <CreditCard className="h-3 w-3" /> Card
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatINR(paymentStats.cardTotal)}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-1.5 border border-amber-200/50 dark:border-amber-800/30">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                <Banknote className="h-3 w-3" /> Cash
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatINR(paymentStats.cashTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: Revenue Sources Split */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Client vs Staff Revenue
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-400">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {formatINR(paymentStats.clientTotal)}
              </span>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                Total Client Collections (Plans + Products)
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span> Plan Fees:
              </span>
              <span className="text-zinc-900 dark:text-zinc-100">{formatINR(paymentStats.clientPlanTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-500"></span> Store Products:
              </span>
              <span className="text-zinc-900 dark:text-zinc-100">{formatINR(paymentStats.clientProductTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span> Staff Advances:
              </span>
              <span className="text-zinc-900 dark:text-zinc-100">{formatINR(paymentStats.staffAdvanceTotal)}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Client Stats & Today's Attendance */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Clients Attendance Today
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/20 dark:text-sky-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {attendanceStats.totalClients}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5 font-medium">Total Clients</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2 border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Present</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
                  {attendanceStats.presentClients}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-rose-50 dark:bg-rose-950/30 p-2 border border-rose-200/50 dark:border-rose-800/30">
                <div className="flex items-center gap-1.5">
                  <UserX className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Absent</span>
                </div>
                <span className="text-sm font-extrabold text-rose-800 dark:text-rose-200">
                  {attendanceStats.absentClients}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Staff Stats & Today's Attendance */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Staff Attendance Today
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/20 dark:text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {attendanceStats.totalStaff}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5 font-medium">Total Staff</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2 border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Present</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
                  {attendanceStats.presentStaff}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-rose-50 dark:bg-rose-950/30 p-2 border border-rose-200/50 dark:border-rose-800/30">
                <div className="flex items-center gap-1.5">
                  <UserX className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Absent</span>
                </div>
                <span className="text-sm font-extrabold text-rose-800 dark:text-rose-200">
                  {attendanceStats.absentStaff}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRAPHICAL REPRESENTATIONS SECTION */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* GRAPH 1: Payment Mode Distribution (SVG Donut Chart) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Payment Mode Distribution
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-zinc-400">
                UPI / Card / Cash
              </span>
            </div>

            {/* Donut Chart Visual */}
            <div className="flex flex-col items-center justify-center my-4 relative">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="14"
                  fill="transparent"
                  className="text-zinc-100 dark:text-zinc-800"
                />

                {paymentStats.totalCollected > 0 ? (
                  <>
                    {/* UPI Segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10b981" // Emerald
                      strokeWidth="14"
                      strokeDasharray={`${(paymentStats.upiPercent * 251.2) / 100} 251.2`}
                      strokeDashoffset="0"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                    {/* Card Segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#8b5cf6" // Violet
                      strokeWidth="14"
                      strokeDasharray={`${(paymentStats.cardPercent * 251.2) / 100} 251.2`}
                      strokeDashoffset={`-${(paymentStats.upiPercent * 251.2) / 100}`}
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                    {/* Cash Segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f59e0b" // Amber
                      strokeWidth="14"
                      strokeDasharray={`${(paymentStats.cashPercent * 251.2) / 100} 251.2`}
                      strokeDashoffset={`-${((paymentStats.upiPercent + paymentStats.cardPercent) * 251.2) / 100}`}
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                    {/* Other Segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#3b82f6" // Blue
                      strokeWidth="14"
                      strokeDasharray={`${(paymentStats.otherPercent * 251.2) / 100} 251.2`}
                      strokeDashoffset={`-${((paymentStats.upiPercent + paymentStats.cardPercent + paymentStats.cashPercent) * 251.2) / 100}`}
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </>
                ) : null}
              </svg>

              {/* Center Total Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-zinc-400">Total Collected</span>
                <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {formatINR(paymentStats.totalCollected)}
                </span>
              </div>
            </div>
          </div>

          {/* Donut Legend Items */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> UPI ({paymentStats.upiPercent}%)
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(paymentStats.upiTotal)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-500"></span> Card ({paymentStats.cardPercent}%)
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(paymentStats.cardTotal)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Cash ({paymentStats.cashPercent}%)
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(paymentStats.cashTotal)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Other ({paymentStats.otherPercent}%)
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(paymentStats.otherTotal)}</span>
            </div>
          </div>
        </div>

        {/* GRAPH 2: Revenue Stream Source Breakdown (Progress Bar Charts) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Revenue Collection Streams
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-zinc-400">
                Source Split
              </span>
            </div>

            <div className="space-y-4 my-2">
              {/* Stream 1: Client Membership Plans */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-amber-500" /> Client Plan Fees
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatINR(paymentStats.clientPlanTotal)}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                    style={{
                      width: `${
                        paymentStats.totalCollected > 0
                          ? (paymentStats.clientPlanTotal / paymentStats.totalCollected) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Stream 2: Products & Supplements */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-cyan-500" /> Products & Store Sales
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatINR(paymentStats.clientProductTotal)}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${
                        paymentStats.totalCollected > 0
                          ? (paymentStats.clientProductTotal / paymentStats.totalCollected) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Stream 3: Staff Advances / Repayments */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-500" /> Staff Advance Settlements
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatINR(paymentStats.staffAdvanceTotal)}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${
                        paymentStats.totalCollected > 0
                          ? (paymentStats.staffAdvanceTotal / paymentStats.totalCollected) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Client Share: {paymentStats.totalCollected > 0 ? Math.round((paymentStats.clientTotal / paymentStats.totalCollected) * 100) : 0}%</span>
            <span>Staff Share: {paymentStats.totalCollected > 0 ? Math.round((paymentStats.staffAdvanceTotal / paymentStats.totalCollected) * 100) : 0}%</span>
          </div>
        </div>

        {/* GRAPH 3: Attendance Split Bar Graphic (Client vs Staff Present/Absent) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Member Attendance Split Today
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                {attendanceStats.overallRate}% Turnout
              </span>
            </div>

            <div className="space-y-5 my-2">
              {/* Clients Attendance Visual */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-zinc-700 dark:text-zinc-300">Client Members</span>
                  <span className="text-zinc-500">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{attendanceStats.presentClients} Present</span> / <span className="text-rose-600 dark:text-rose-400">{attendanceStats.absentClients} Absent</span>
                  </span>
                </div>
                <div className="h-4 w-full rounded-lg bg-rose-100 dark:bg-rose-950/40 overflow-hidden flex border border-zinc-200 dark:border-zinc-700/60">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700 flex items-center justify-center text-[10px] font-extrabold text-white"
                    style={{
                      width: `${
                        attendanceStats.totalClients > 0
                          ? (attendanceStats.presentClients / attendanceStats.totalClients) * 100
                          : 0
                      }%`,
                    }}
                  >
                    {attendanceStats.presentClients > 0 ? `${attendanceStats.presentClients}` : ""}
                  </div>
                </div>
              </div>

              {/* Staff Attendance Visual */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-zinc-700 dark:text-zinc-300">Staff Members</span>
                  <span className="text-zinc-500">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{attendanceStats.presentStaff} Present</span> / <span className="text-rose-600 dark:text-rose-400">{attendanceStats.absentStaff} Absent</span>
                  </span>
                </div>
                <div className="h-4 w-full rounded-lg bg-rose-100 dark:bg-rose-950/40 overflow-hidden flex border border-zinc-200 dark:border-zinc-700/60">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700 flex items-center justify-center text-[10px] font-extrabold text-white"
                    style={{
                      width: `${
                        attendanceStats.totalStaff > 0
                          ? (attendanceStats.presentStaff / attendanceStats.totalStaff) * 100
                          : 0
                      }%`,
                    }}
                  >
                    {attendanceStats.presentStaff > 0 ? `${attendanceStats.presentStaff}` : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">Total Check-ins Today:</span>
            <span className="font-extrabold text-zinc-900 dark:text-zinc-100 bg-amber-500/10 px-2 py-0.5 rounded text-amber-700 dark:text-amber-300">
              {attendanceStats.combinedPresent} / {attendanceStats.combinedTotal} Members
            </span>
          </div>
        </div>
      </div>

      {/* LIVE ACTIVITY FEED & RECENT TRANSACTIONS TABLE */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Table Tab Controls Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "payments"
                  ? "bg-amber-500 text-zinc-950 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Recent Payments ({filteredPayments.length})
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "attendance"
                  ? "bg-amber-500 text-zinc-950 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Today's Check-in Log ({attendanceLogs.filter((l) => l.date === todayStr).length})
            </button>
          </div>

          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Updated Realtime
          </span>
        </div>

        {/* Tab 1: Payments List */}
        {activeTab === "payments" && (
          <div className="overflow-x-auto">
            {filteredPayments.length === 0 ? (
              <div className="p-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                No payment transactions recorded for the selected outlet and date range.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Member / Customer</th>
                    <th className="px-5 py-3 font-semibold">Payment Category</th>
                    <th className="px-5 py-3 font-semibold">Payment Mode</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredPayments.slice(0, 15).map((p) => {
                    const modeLower = (p.mode || "").toLowerCase();
                    const isUPI = modeLower.includes("upi") || modeLower.includes("gpay") || modeLower.includes("phonepe") || modeLower.includes("paytm");
                    const isCard = modeLower.includes("card") || modeLower.includes("debit") || modeLower.includes("credit");

                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                        <td className="px-5 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                          {p.memberName}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              p.type === "client_plan"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : p.type === "client_product"
                                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                                : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            }`}
                          >
                            {p.type === "client_plan"
                              ? "Membership Plan"
                              : p.type === "client_product"
                              ? "Product Purchase"
                              : "Staff Advance"}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isUPI
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : isCard
                                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {isUPI && <QrCode className="h-3 w-3" />}
                            {isCard && <CreditCard className="h-3 w-3" />}
                            {!isUPI && !isCard && <Banknote className="h-3 w-3" />}
                            {p.mode || "Cash"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400 font-medium">
                          {p.date}
                        </td>
                        <td className="px-5 py-3 text-right font-extrabold text-zinc-900 dark:text-zinc-100">
                          {formatINR(p.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Today's Check-in Log */}
        {activeTab === "attendance" && (
          <div className="overflow-x-auto">
            {attendanceLogs.filter((l) => l.date === todayStr).length === 0 ? (
              <div className="p-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                No member check-in records recorded for today yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Member Name</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Check-in Time</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {attendanceLogs
                    .filter((l) => l.date === todayStr)
                    .slice(0, 15)
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                        <td className="px-5 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                          {log.memberName}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              log.type === "client"
                                ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            }`}
                          >
                            {log.type === "client" ? "Client" : "Staff"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400 font-medium">
                          {log.inTime || "Present"}
                        </td>
                        <td className="px-5 py-3 font-bold">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Present
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
