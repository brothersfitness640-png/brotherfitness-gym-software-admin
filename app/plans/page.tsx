"use client";

import { useState, useEffect } from "react";
import PageContainer from "@/components/PageContainer";
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
} from "firebase/firestore";
import {
  Layers,
  IndianRupee,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  Search,
  Filter,
  Loader2,
  Sparkles,
} from "lucide-react";

interface MembershipPlan {
  id: string;
  name: string;
  amount: number;
  duration?: string;
  description?: string;
  createdAt?: any;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [planDuration, setPlanDuration] = useState("1 Month");
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time listener for Firestore "plans" collection
  useEffect(() => {
    const plansRef = collection(db, "plans");
    const q = query(plansRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedPlans: MembershipPlan[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as MembershipPlan[];
        setPlans(fetchedPlans);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching plans:", error);
        // Fallback if index isn't built yet
        const fallbackUnsub = onSnapshot(plansRef, (snapshot) => {
          const fetchedPlans: MembershipPlan[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as MembershipPlan[];
          setPlans(fetchedPlans);
          setLoading(false);
        });
        return () => fallbackUnsub();
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setPlanName("");
    setPlanAmount("");
    setPlanDuration("1 Month");
    setIsModalOpen(true);
  };

  const handleEditClick = (plan: MembershipPlan) => {
    setEditingId(plan.id);
    setPlanName(plan.name);
    setPlanAmount(plan.amount.toString());
    setPlanDuration(plan.duration || "1 Month");
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim() || !planAmount) return;

    setSaving(true);
    try {
      if (editingId) {
        // Update Existing Plan
        await updateDoc(doc(db, "plans", editingId), {
          name: planName.trim(),
          amount: parseFloat(planAmount),
          duration: planDuration,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Add New Plan
        await addDoc(collection(db, "plans"), {
          name: planName.trim(),
          amount: parseFloat(planAmount),
          duration: planDuration,
          createdAt: serverTimestamp(),
        });
      }

      setIsModalOpen(false);
      setPlanName("");
      setPlanAmount("");
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save plan to Firebase:", err);
      alert("Failed to save plan. Please check your network connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete plan "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "plans", id));
      } catch (err) {
        console.error("Failed to delete plan:", err);
        alert("Failed to delete plan.");
      }
    }
  };

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer
      title="Plans"
      subtitle="Configure gym membership packages and pricing tiers"
      actionText="Add Plan"
      onActionClick={handleOpenAddModal}
    >
      {/* Top Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Active Plans
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {plans.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Configured
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Starting Price
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {plans.length > 0
                ? `₹${Math.min(...plans.map((p) => p.amount))}`
                : "₹0"}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Lowest Tier
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Firebase Storage
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Connected
            </span>
            <span className="text-[11px] font-medium text-zinc-400">Live Sync</span>
          </div>
        </div>
      </div>

      {/* Main Table / Grid Container */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 px-5 py-3 gap-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Membership Packages
            </span>
            <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-400/30">
              {plans.length} Total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search plan name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-48 rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-medium outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500 mb-2" />
            <span className="text-xs text-zinc-500 font-medium">
              Loading plans from Firebase...
            </span>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-400/30">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {searchQuery ? "No matching plans found" : "No Membership Plans Yet"}
            </h3>
            <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              Click the Add Plan button to define your gym membership packages.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Plan Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Plan Name</th>
                  <th className="px-5 py-3 font-semibold">Duration</th>
                  <th className="px-5 py-3 font-semibold">Amount (₹)</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 text-amber-700 dark:text-amber-400 border border-amber-400/20 font-semibold">
                          <Layers className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                          {plan.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300 font-medium">
                      <span className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800 dark:text-zinc-300">
                        {plan.duration || "1 Month"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-400/30">
                        <IndianRupee className="h-3 w-3" />
                        {plan.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(plan)}
                          className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
                          title="Edit Plan"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id, plan.name)}
                          className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400 transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Plan Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-black">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingId ? "Edit Membership Plan" : "Add New Plan"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePlan} className="mt-4 flex flex-col gap-4">
              {/* Plan Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Gold, 3 Months Transformation"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                />
              </div>

              {/* Amount (₹) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="e.g. 1500"
                    value={planAmount}
                    onChange={(e) => setPlanAmount(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-7 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Plan Duration
                </label>
                <select
                  value={planDuration}
                  onChange={(e) => setPlanDuration(e.target.value)}
                  className="cursor-pointer h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                >
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="mt-2 flex items-center justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-500 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Save Plan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
