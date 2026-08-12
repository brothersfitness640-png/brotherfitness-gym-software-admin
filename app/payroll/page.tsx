"use client";

import { useState, useEffect } from "react";
import PageContainer from "@/components/PageContainer";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import CustomDatePicker from "@/components/CustomDatePicker";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  collectionGroup,
} from "firebase/firestore";
import {
  BadgeIndianRupee,
  Calendar,
  Clock,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  UserCheck,
  Building2,
  IndianRupee,
  FileText,
  CalendarCheck,
  RefreshCw,
  Eye,
  Filter,
  TrendingDown,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HolidayRecord {
  id: string;
  name: string;
  date: string;
  month?: number;
  year?: number;
  createdAt?: any;
}

interface OutletItem {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  name: string;
  mobile: string;
  outletId: string;
  outletName: string;
  monthlySalary: number;
  acceptableLeaves: number;
  photoUrl?: string;
}

interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: string;
}

interface AdvanceInstallmentRecord {
  id: string;
  staffId: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending";
}

interface StaffPayrollRecord {
  id: string;
  staffId: string;
  month: string;
  baseSalary: number;
  dailyRate: number;
  presentDays: number;
  absentDays: number;
  acceptableLeaves: number;
  excessLeaves: number;
  leaveDeduction: number;
  holidaysCount: number;
  advanceDeduction: number;
  netSalary: number;
  status: "Paid" | "Pending";
  paymentDate: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function PayrollPage() {
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [allAttendance, setAllAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [allAdvanceInstallments, setAllAdvanceInstallments] = useState<AdvanceInstallmentRecord[]>([]);
  const [allPayrolls, setAllPayrolls] = useState<StaffPayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Controls & Filters
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOutletFilter, setActiveOutletFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"payroll" | "holidays">("payroll");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 45;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMonth, activeOutletFilter, activeTab]);

  // Payslip Modal State
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [viewingPayslip, setViewingPayslip] = useState<StaffPayrollRecord & { staffName?: string; outletName?: string; mobile?: string } | null>(null);

  // Add / Edit Holiday Modal State
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split("T")[0]);

  // Delete & Save States
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    staffId?: string;
    type: "holiday" | "payroll";
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Outlets Real-Time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "outlets"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
      })) as OutletItem[];
      setOutlets(list);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Holidays Real-Time
  useEffect(() => {
    const holidaysRef = collection(db, "holidays");
    const q = query(holidaysRef, orderBy("date", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as HolidayRecord[];
        setHolidays(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Holidays query fallback:", err);
        onSnapshot(holidaysRef, (snapshot) => {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as HolidayRecord[];
          setHolidays(list);
          setLoading(false);
        });
      }
    );
    return () => unsub();
  }, []);

  // 3. Fetch Staff List Real-Time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "staff"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        mobile: d.data().mobile,
        outletId: d.data().outletId || "",
        outletName: d.data().outletName || "Main Branch",
        monthlySalary: d.data().monthlySalary || 0,
        acceptableLeaves: d.data().acceptableLeaves || 2,
        photoUrl: d.data().photoUrl || "",
      })) as StaffMember[];
      setStaffList(list);
    });
    return () => unsub();
  }, []);

  // 4. Fetch All Attendance Subcollections across staff
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collectionGroup(db, "attendance"),
        (snapshot) => {
          const list = snapshot.docs.map((d) => {
            const data = d.data();
            const pathSegments = d.ref.path.split("/");
            const staffIdFromPath = pathSegments[1];
            return {
              id: d.id,
              staffId: staffIdFromPath,
              ...data,
            } as StaffAttendanceRecord;
          });
          setAllAttendance(list);
        },
        (err) => console.warn("Attendance collectionGroup listener fallback:", err)
      );
      return () => unsub();
    } catch (err) {
      console.warn("CollectionGroup error:", err);
    }
  }, []);

  // 5. Fetch All Advance Installments Subcollections across staff
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collectionGroup(db, "advance_installments"),
        (snapshot) => {
          const list = snapshot.docs.map((d) => {
            const data = d.data();
            const pathSegments = d.ref.path.split("/");
            const staffIdFromPath = pathSegments[1];
            return {
              id: d.id,
              staffId: staffIdFromPath,
              ...data,
            } as AdvanceInstallmentRecord;
          });
          setAllAdvanceInstallments(list);
        },
        (err) => console.warn("Advance installments collectionGroup listener fallback:", err)
      );
      return () => unsub();
    } catch (err) {
      console.warn("CollectionGroup error:", err);
    }
  }, []);

  // 6. Fetch All Payroll Records Subcollections across staff
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collectionGroup(db, "payrolls"),
        (snapshot) => {
          const list = snapshot.docs.map((d) => {
            const data = d.data();
            const pathSegments = d.ref.path.split("/");
            const staffIdFromPath = pathSegments[1];
            return {
              id: d.id,
              staffId: staffIdFromPath,
              ...data,
            } as StaffPayrollRecord;
          });
          setAllPayrolls(list);
        },
        (err) => console.warn("Payrolls collectionGroup listener fallback:", err)
      );
      return () => unsub();
    } catch (err) {
      console.warn("CollectionGroup error:", err);
    }
  }, []);

  // Helper Function: Compute live payroll data for a given staff member and month
  const computeStaffPayrollForMonth = (staff: StaffMember, monthStr: string) => {
    const baseSalary = staff.monthlySalary || 0;
    const dailyRate = Math.round(baseSalary / 30);
    const acceptableLeaves = staff.acceptableLeaves || 2;

    // Attendance in month
    const staffAtt = allAttendance.filter(
      (a) => a.staffId === staff.id && a.date && a.date.startsWith(monthStr)
    );
    const presentDays = staffAtt.filter((a) => a.status === "Present").length;

    // Official Holidays in month
    const monthHolidays = holidays.filter((h) => h.date && h.date.startsWith(monthStr));
    const holidaysCount = monthHolidays.length;

    // Absents & Leave Deductions
    const absentDays = Math.max(0, 30 - presentDays - holidaysCount);
    const excessLeaves = Math.max(0, absentDays - acceptableLeaves);
    const leaveDeduction = excessLeaves * dailyRate;

    // Advance Deductions in month
    const staffAdvInsts = allAdvanceInstallments.filter(
      (i) =>
        i.staffId === staff.id &&
        i.date &&
        i.date.startsWith(monthStr) &&
        i.status === "Paid"
    );
    const advanceDeduction = staffAdvInsts.reduce((sum, i) => sum + i.amount, 0);

    const netSalary = Math.max(0, baseSalary - leaveDeduction - advanceDeduction);

    // Existing saved payslip for this month
    const existingPayslip = allPayrolls.find(
      (p) => p.staffId === staff.id && p.month === monthStr
    );

    return {
      staff,
      monthStr,
      baseSalary,
      dailyRate,
      presentDays,
      absentDays,
      acceptableLeaves,
      excessLeaves,
      leaveDeduction,
      holidaysCount,
      advanceDeduction,
      netSalary,
      existingPayslip,
      isSaved: !!existingPayslip,
    };
  };

  // Filtered Staff List based on Outlet Filter & Search Query
  const filteredStaffList = staffList.filter((staff) => {
    const matchSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.mobile.includes(searchQuery) ||
      staff.outletName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (activeOutletFilter !== "all" && staff.outletId !== activeOutletFilter) {
      return false;
    }
    return true;
  });

  // Computed Live Staff Payroll Array for Selected Month
  const computedStaffPayrolls = filteredStaffList.map((staff) =>
    computeStaffPayrollForMonth(staff, selectedMonth)
  );

  const totalPages = Math.ceil(computedStaffPayrolls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaffPayrolls = computedStaffPayrolls.slice(startIndex, startIndex + itemsPerPage);

  // Overall Analytics Summary for Selected Month & Outlet Filter
  const totalBaseBudget = computedStaffPayrolls.reduce((sum, c) => sum + c.baseSalary, 0);
  const totalNetPayableToCredit = computedStaffPayrolls.reduce((sum, c) => sum + c.netSalary, 0);
  const totalLeaveDeductions = computedStaffPayrolls.reduce((sum, c) => sum + c.leaveDeduction, 0);
  const totalAdvanceDeductions = computedStaffPayrolls.reduce((sum, c) => sum + c.advanceDeduction, 0);
  const totalSavedPayslipsCount = computedStaffPayrolls.filter((c) => c.isSaved).length;

  // Single Staff Save / Update Payslip Handler (Keyed by YYYY-MM so updating tomorrow updates the record cleanly!)
  const handleSaveOrUpdatePayslip = async (calc: ReturnType<typeof computeStaffPayrollForMonth>) => {
    setSaving(true);
    try {
      const payslipData = {
        month: calc.monthStr,
        baseSalary: calc.baseSalary,
        dailyRate: calc.dailyRate,
        presentDays: calc.presentDays,
        absentDays: calc.absentDays,
        acceptableLeaves: calc.acceptableLeaves,
        excessLeaves: calc.excessLeaves,
        leaveDeduction: calc.leaveDeduction,
        holidaysCount: calc.holidaysCount,
        advanceDeduction: calc.advanceDeduction,
        netSalary: calc.netSalary,
        status: "Paid",
        paymentDate: new Date().toISOString().split("T")[0],
        updatedAt: serverTimestamp(),
      };

      await setDoc(
        doc(db, "staff", calc.staff.id, "payrolls", calc.monthStr),
        payslipData,
        { merge: true }
      );

      alert(`Payslip for ${calc.staff.name} (${calc.monthStr}) saved/updated successfully!`);
    } catch (err) {
      console.error("Error saving staff payslip:", err);
      alert("Failed to save staff payslip.");
    } finally {
      setSaving(false);
    }
  };

  // Batch Action: Generate & Save Payslips for All Staff in Filter
  const handleBatchGenerateAllPayslips = async () => {
    if (computedStaffPayrolls.length === 0) return;
    setSaving(true);
    try {
      for (const calc of computedStaffPayrolls) {
        const payslipData = {
          month: calc.monthStr,
          baseSalary: calc.baseSalary,
          dailyRate: calc.dailyRate,
          presentDays: calc.presentDays,
          absentDays: calc.absentDays,
          acceptableLeaves: calc.acceptableLeaves,
          excessLeaves: calc.excessLeaves,
          leaveDeduction: calc.leaveDeduction,
          holidaysCount: calc.holidaysCount,
          advanceDeduction: calc.advanceDeduction,
          netSalary: calc.netSalary,
          status: "Paid",
          paymentDate: new Date().toISOString().split("T")[0],
          updatedAt: serverTimestamp(),
        };

        await setDoc(
          doc(db, "staff", calc.staff.id, "payrolls", calc.monthStr),
          payslipData,
          { merge: true }
        );
      }
      alert(`Payslips generated and saved for all ${computedStaffPayrolls.length} staff members for ${selectedMonth}!`);
    } catch (err) {
      console.error("Error batch generating payslips:", err);
      alert("Failed to generate payslips for all staff.");
    } finally {
      setSaving(false);
    }
  };

  // Holiday Modal Handlers
  const handleOpenAddHolidayModal = (h?: HolidayRecord) => {
    if (h) {
      setEditingHolidayId(h.id);
      setHolidayName(h.name);
      setHolidayDate(h.date);
    } else {
      setEditingHolidayId(null);
      setHolidayName("");
      setHolidayDate(new Date().toISOString().split("T")[0]);
    }
    setIsHolidayModalOpen(true);
  };

  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim() || !holidayDate) return;
    setSaving(true);
    try {
      const dateObj = new Date(holidayDate);
      const hData = {
        name: holidayName.trim(),
        date: holidayDate,
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear(),
        updatedAt: serverTimestamp(),
      };

      if (editingHolidayId) {
        await updateDoc(doc(db, "holidays", editingHolidayId), hData);
      } else {
        await addDoc(collection(db, "holidays"), {
          ...hData,
          createdAt: serverTimestamp(),
        });
      }
      setIsHolidayModalOpen(false);
    } catch (err) {
      console.error("Error saving holiday:", err);
      alert("Failed to save holiday.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHolidayClick = (h: HolidayRecord) => {
    setDeleteTarget({
      id: h.id,
      type: "holiday",
      name: h.name,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "holiday") {
        await deleteDoc(doc(db, "holidays", deleteTarget.id));
      } else if (deleteTarget.type === "payroll" && deleteTarget.staffId) {
        await deleteDoc(doc(db, "staff", deleteTarget.staffId, "payrolls", deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredHolidays = holidays.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.date.includes(searchQuery)
  );

  return (
    <PageContainer
      title="Staff Payroll & Salary Engine"
      subtitle="Calculate net salaries, process branch payouts, generate payslips, and manage official holidays"
      actionText="+ Add Official Holiday"
      onActionClick={() => handleOpenAddHolidayModal()}
    >
      {/* Top Analytics Summary Cards Header */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs dark:border-emerald-950/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Total Salaries To Credit ({selectedMonth})
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
              ₹
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              ₹{totalNetPayableToCredit.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-emerald-600">Net Payable</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Base Payroll Budget
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <BadgeIndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              ₹{totalBaseBudget.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-zinc-400">{filteredStaffList.length} Staff</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
              Total Leave Deductions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/10 text-red-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              -₹{totalLeaveDeductions.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-red-500">Excess Absents</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Advance Salary Deductions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              -₹{totalAdvanceDeductions.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-amber-600">Settled Advances</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Navigation & Controls Bar */}
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Main Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab("payroll")}
                className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === "payroll"
                    ? "bg-amber-400 text-black shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Staff Payroll & Payslips ({computedStaffPayrolls.length})
              </button>
              <button
                onClick={() => setActiveTab("holidays")}
                className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === "holidays"
                    ? "bg-amber-400 text-black shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Official Gym Holidays ({holidays.length})
              </button>
            </div>

            {/* Month & Batch Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 dark:border-zinc-800 dark:bg-zinc-800">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-semibold text-zinc-500">Payroll Month:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs font-bold text-zinc-900 outline-none dark:text-zinc-100 cursor-pointer"
                />
              </div>

              {activeTab === "payroll" && (
                <button
                  onClick={handleBatchGenerateAllPayslips}
                  disabled={saving || computedStaffPayrolls.length === 0}
                  className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 text-xs font-bold text-black hover:bg-amber-500 shadow-md transition-transform active:scale-98"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  <span>Generate All Payslips ({selectedMonth})</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub Toolbar: Outlet Branch Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 gap-3">
            {/* Dynamic Outlet Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveOutletFilter("all")}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeOutletFilter === "all"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                All Branches ({staffList.length})
              </button>

              {outlets.map((o) => {
                const count = staffList.filter((s) => s.outletId === o.id).length;
                return (
                  <button
                    key={o.id}
                    onClick={() => setActiveOutletFilter(o.id)}
                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                      activeOutletFilter === o.id
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {o.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search staff by name or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-56 rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* TAB 1: STAFF PAYROLL BREAKDOWN LIST */}
        {activeTab === "payroll" && (
          <div className="p-5">
            {computedStaffPayrolls.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <UserCheck className="h-8 w-8 text-zinc-400 mb-2" />
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No Staff Members Found</h4>
                <p className="text-xs text-zinc-500 mt-1 mb-4">Add staff members to calculate and generate monthly salary payslips.</p>
              </div>
            ) : (
              <div>
                {/* Mobile & Tablet Card View (< md) */}
                <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                  {paginatedStaffPayrolls.map((calc) => (
                    <div key={calc.staff.id} className="p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-amber-400/10 border border-amber-400 shrink-0">
                            {calc.staff.photoUrl ? (
                              <img src={calc.staff.photoUrl} alt={calc.staff.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-amber-700 text-xs">
                                {calc.staff.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm block">{calc.staff.name}</span>
                            <span className="text-xs text-zinc-500">{calc.staff.outletName}</span>
                          </div>
                        </div>

                        {calc.isSaved ? (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                            ✓ Generated
                          </span>
                        ) : (
                          <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg">
                          <span className="text-[10px] text-zinc-400 block font-medium">Base Salary</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{calc.baseSalary.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg">
                          <span className="text-[10px] text-zinc-400 block font-medium">Net Salary</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{calc.netSalary.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                        <span>Attendance: <strong>{calc.presentDays} Present</strong> • {calc.absentDays} Absents</span>
                        <span className="text-red-500 font-semibold">-₹{calc.leaveDeduction.toLocaleString("en-IN")}</span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => handleSaveOrUpdatePayslip(calc)}
                          disabled={saving}
                          className="cursor-pointer flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-500 shadow-xs"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>{calc.isSaved ? "Update" : "Save"} Payslip</span>
                        </button>

                        {calc.isSaved && (
                          <button
                            onClick={() => {
                              setViewingPayslip({
                                ...calc.existingPayslip!,
                                staffName: calc.staff.name,
                                outletName: calc.staff.outletName,
                                mobile: calc.staff.mobile,
                              });
                              setIsPayslipModalOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                            title="View Payslip"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Staff Employee</th>
                        <th className="px-4 py-3 font-semibold">Branch Outlet</th>
                        <th className="px-4 py-3 font-semibold">Base Salary (30d)</th>
                        <th className="px-4 py-3 font-semibold">Attendance Summary</th>
                        <th className="px-4 py-3 font-semibold">Leave Deductions</th>
                        <th className="px-4 py-3 font-semibold">Advance Deductions</th>
                        <th className="px-4 py-3 font-semibold">Net Salary To Credit</th>
                        <th className="px-4 py-3 font-semibold">Payslip Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {paginatedStaffPayrolls.map((calc) => (
                        <tr key={calc.staff.id} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full overflow-hidden bg-amber-400/10 border border-amber-400 shrink-0">
                                {calc.staff.photoUrl ? (
                                  <img src={calc.staff.photoUrl} alt={calc.staff.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center font-bold text-amber-700 text-xs">
                                    {calc.staff.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{calc.staff.name}</span>
                                <span className="text-[11px] text-zinc-400 font-medium">{calc.staff.mobile}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300">
                            <span className="rounded bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-400/30">
                              {calc.staff.outletName}
                            </span>
                          </td>

                          <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                            ₹{calc.baseSalary.toLocaleString("en-IN")}
                            <span className="text-[10px] text-zinc-400 font-medium block">₹{calc.dailyRate}/day</span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300 block">
                              {calc.presentDays} Present • {calc.holidaysCount} Holidays
                            </span>
                            <span className="text-[11px] text-zinc-400 font-medium block">
                              {calc.absentDays} Absents ({calc.acceptableLeaves} Allowed)
                            </span>
                          </td>

                          <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">
                            -₹{calc.leaveDeduction.toLocaleString("en-IN")}
                            {calc.excessLeaves > 0 && (
                              <span className="text-[10px] text-red-500 font-medium block">({calc.excessLeaves} excess days)</span>
                            )}
                          </td>

                          <td className="px-4 py-3 font-semibold text-amber-700 dark:text-amber-400">
                            -₹{calc.advanceDeduction.toLocaleString("en-IN")}
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                              ₹{calc.netSalary.toLocaleString("en-IN")}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {calc.isSaved ? (
                              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                                ✓ Payslip Generated
                              </span>
                            ) : (
                              <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                                Pending Generation
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveOrUpdatePayslip(calc)}
                                disabled={saving}
                                className="cursor-pointer flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-semibold text-black hover:bg-amber-500 shadow-xs"
                                title="Update / Save Payslip"
                              >
                                <RefreshCw className="h-3 w-3" />
                                <span>{calc.isSaved ? "Update Payslip" : "Save Payslip"}</span>
                              </button>

                              {calc.isSaved && (
                                <button
                                  onClick={() => {
                                    setViewingPayslip({
                                      ...calc.existingPayslip!,
                                      staffName: calc.staff.name,
                                      outletName: calc.staff.outletName,
                                      mobile: calc.staff.mobile,
                                    });
                                    setIsPayslipModalOpen(true);
                                  }}
                                  className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                                  title="View Payslip"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900 text-xs mt-3 rounded-xl">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                      Showing <strong className="text-zinc-900 dark:text-zinc-100">{startIndex + 1}</strong> to{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100">{Math.min(startIndex + itemsPerPage, computedStaffPayrolls.length)}</strong> of{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100">{computedStaffPayrolls.length}</strong> payroll records
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </button>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HOLIDAYS MANAGEMENT LIST */}
        {activeTab === "holidays" && (
          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
                <span className="text-xs font-semibold text-zinc-500">Loading official holidays...</span>
              </div>
            ) : filteredHolidays.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <CalendarCheck className="h-8 w-8 text-zinc-400 mb-2" />
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No Holidays Listed</h4>
                <p className="text-xs text-zinc-500 mt-1 mb-4">
                  Add official gym holidays (e.g., Diwali, New Year) so they are excluded from staff leave deductions.
                </p>
                <button
                  onClick={() => handleOpenAddHolidayModal()}
                  className="cursor-pointer rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-amber-500"
                >
                  + Add Holiday Now
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredHolidays.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/20 text-amber-700 font-bold border border-amber-400/40">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{h.name}</h4>
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{h.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAddHolidayModal(h)}
                        className="cursor-pointer flex h-7 w-7 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                        title="Edit Holiday"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHolidayClick(h)}
                        className="cursor-pointer flex h-7 w-7 items-center justify-center rounded border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400"
                        title="Delete Holiday"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL 1: DETAILED PAYSLIP PRINT MODAL --- */}
      {isPayslipModalOpen && viewingPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Brothers Fitness • Staff Salary Payslip ({viewingPayslip.month})
                </h3>
              </div>
              <button onClick={() => setIsPayslipModalOpen(false)} className="cursor-pointer text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-amber-400/10 p-3 border border-amber-400/30">
                <div>
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">{viewingPayslip.staffName}</span>
                  <span className="text-[11px] text-zinc-500 font-medium">{viewingPayslip.outletName} • Mobile: {viewingPayslip.mobile}</span>
                </div>
                <span className="rounded bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">PAYSLIP GENERATED</span>
              </div>

              <div className="grid grid-cols-2 gap-3 border-y border-zinc-200 py-3 dark:border-zinc-800">
                <div>
                  <span className="text-zinc-400 block font-medium">Base Monthly Salary:</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">₹{viewingPayslip.baseSalary?.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-medium">Daily Rate (30 Days Basis):</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">₹{viewingPayslip.dailyRate}/day</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-medium">Days Present:</span>
                  <span className="text-sm font-semibold text-emerald-600">{viewingPayslip.presentDays} Days</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-medium">Official Holidays:</span>
                  <span className="text-sm font-semibold text-amber-600">{viewingPayslip.holidaysCount} Days</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-zinc-600 dark:text-zinc-300">Excess Leaves Deduction ({viewingPayslip.excessLeaves} days):</span>
                  <span className="text-red-600">-₹{viewingPayslip.leaveDeduction?.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between font-semibold">
                  <span className="text-zinc-600 dark:text-zinc-300">Advance Salary Deductions:</span>
                  <span className="text-amber-600">-₹{viewingPayslip.advanceDeduction?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 border border-emerald-300 dark:bg-emerald-950/40">
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">NET PAYABLE SALARY:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{viewingPayslip.netSalary?.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPayslipModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-600"
                >
                  Close Payslip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD / EDIT HOLIDAY MODAL --- */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingHolidayId ? "Edit Gym Holiday" : "Add Official Gym Holiday"}
                </h3>
              </div>
              <button onClick={() => setIsHolidayModalOpen(false)} className="cursor-pointer text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Festival / New Year's Day"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Holiday Date *
                </label>
                <CustomDatePicker
                  value={holidayDate}
                  onChange={(val) => setHolidayDate(val)}
                />
              </div>

              <div className="mt-3 flex justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-500"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Save Holiday</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Record"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
