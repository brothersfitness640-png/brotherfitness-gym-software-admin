"use client";

import { useState, useEffect } from "react";
import PageContainer from "@/components/PageContainer";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
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
} from "lucide-react";

interface HolidayRecord {
  id: string;
  name: string;
  date: string;
  month?: number;
  year?: number;
  createdAt?: any;
}

interface StaffMember {
  id: string;
  name: string;
  outletName: string;
  monthlySalary: number;
}

interface PayrollRunRecord {
  id: string;
  staffId?: string;
  staffName?: string;
  outletName?: string;
  month: string;
  baseSalary: number;
  leaveDeduction: number;
  advanceDeduction: number;
  netSalary: number;
  status: string;
  paymentDate: string;
}

export default function PayrollPage() {
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [allPayrolls, setAllPayrolls] = useState<PayrollRunRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Tab State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"payroll" | "holidays">("holidays");

  // Add / Edit Holiday Modal State
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split("T")[0]);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "holiday" | "payroll";
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Holidays Real-Time
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

  // 2. Fetch Staff List Real-Time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "staff"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        outletName: d.data().outletName || "Main Branch",
        monthlySalary: d.data().monthlySalary || 0,
      })) as StaffMember[];
      setStaffList(list);
    });
    return () => unsub();
  }, []);

  // 3. Fetch All Staff Payroll Runs across subcollections
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collectionGroup(db, "payrolls"),
        (snapshot) => {
          const list = snapshot.docs.map((d) => {
            const data = d.data();
            const pathSegments = d.ref.path.split("/");
            const staffIdFromPath = pathSegments[1];
            const matchedStaff = staffList.find((s) => s.id === staffIdFromPath);

            return {
              id: d.id,
              staffId: staffIdFromPath,
              staffName: matchedStaff ? matchedStaff.name : "Staff Employee",
              outletName: matchedStaff ? matchedStaff.outletName : "Main Branch",
              ...data,
            } as PayrollRunRecord;
          });
          setAllPayrolls(list);
        },
        (err) => {
          console.warn("Payrolls collectionGroup listener fallback:", err);
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn("CollectionGroup error:", err);
    }
  }, [staffList]);

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

  const totalPayrollBudget = staffList.reduce((sum, s) => sum + s.monthlySalary, 0);

  return (
    <PageContainer
      title="Payroll & Holidays Management"
      subtitle="Configure official gym holidays, process staff salary payouts, and inspect payslip archives"
      actionText="+ Add Official Holiday"
      onActionClick={() => handleOpenAddHolidayModal()}
    >
      {/* Top Stat Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Monthly Payroll Budget
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <BadgeIndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              ₹{totalPayrollBudget.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-zinc-400">{staffList.length} Employees</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Official Gym Holidays
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {holidays.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Listed Holidays
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Processed Payslips
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {allPayrolls.length}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Saved Runs
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Toolbar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 px-5 py-3.5 gap-3 dark:border-zinc-800">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("holidays")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === "holidays"
                  ? "bg-amber-400 text-black shadow-xs font-semibold"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Official Gym Holidays ({holidays.length})
            </button>
            <button
              onClick={() => setActiveTab("payroll")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === "payroll"
                  ? "bg-amber-400 text-black shadow-xs font-semibold"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              Staff Salary Payslips ({allPayrolls.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-48 rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
              />
            </div>

            <button
              onClick={() => handleOpenAddHolidayModal()}
              className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 text-xs font-semibold text-black hover:bg-amber-500 shadow-md transition-transform active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Add Holiday</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HOLIDAYS MANAGEMENT LIST */}
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

        {/* TAB 2: GLOBAL PAYROLL OVERVIEW */}
        {activeTab === "payroll" && (
          <div className="p-5">
            {allPayrolls.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <BadgeIndianRupee className="h-8 w-8 text-zinc-400 mb-2" />
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No Payroll Runs Processed Yet</h4>
                <p className="text-xs text-zinc-500 mt-1 mb-4">
                  Navigate to Staff Details → Salary Engine tab to process and generate monthly staff payslips.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Staff Employee</th>
                      <th className="px-4 py-3 font-semibold">Branch Outlet</th>
                      <th className="px-4 py-3 font-semibold">Payroll Month</th>
                      <th className="px-4 py-3 font-semibold">Base Salary</th>
                      <th className="px-4 py-3 font-semibold">Leave Deductions</th>
                      <th className="px-4 py-3 font-semibold">Advance Deductions</th>
                      <th className="px-4 py-3 font-semibold">Net Payout (₹)</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {allPayrolls.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">{p.staffName || "Staff Employee"}</td>
                        <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300">{p.outletName || "Main Branch"}</td>
                        <td className="px-4 py-3 font-semibold text-amber-700 dark:text-amber-400">{p.month}</td>
                        <td className="px-4 py-3 font-medium text-zinc-600">₹{(p.baseSalary || 0).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 font-medium text-red-600">-₹{(p.leaveDeduction || 0).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 font-medium text-amber-600">-₹{(p.advanceDeduction || 0).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 font-black text-emerald-600">₹{(p.netSalary || 0).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                            {p.status || "Paid"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- ADD / EDIT HOLIDAY MODAL --- */}
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
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
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
        title="Delete Holiday Record"
        message={`Are you sure you want to delete official holiday "${deleteTarget?.name}"?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
