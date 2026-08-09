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
} from "firebase/firestore";
import {
  Building2,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";

interface GymOutlet {
  id: string;
  name: string;
  address: string;
  phone?: string;
  createdAt?: any;
}

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<GymOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time listener for Firestore "outlets" collection
  useEffect(() => {
    const outletsRef = collection(db, "outlets");
    const q = query(outletsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOutlets: GymOutlet[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as GymOutlet[];
        setOutlets(fetchedOutlets);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching outlets:", error);
        // Fallback snapshot without order
        const fallbackUnsub = onSnapshot(outletsRef, (snapshot) => {
          const fetchedOutlets: GymOutlet[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as GymOutlet[];
          setOutlets(fetchedOutlets);
          setLoading(false);
        });
        return () => fallbackUnsub();
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName("");
    setAddress("");
    setPhone("");
    setIsModalOpen(true);
  };

  const handleEditClick = (outlet: GymOutlet) => {
    setEditingId(outlet.id);
    setName(outlet.name);
    setAddress(outlet.address);
    setPhone(outlet.phone || "");
    setIsModalOpen(true);
  };

  const handleSaveOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        // Update Existing Outlet
        await updateDoc(doc(db, "outlets", editingId), {
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Add New Outlet
        await addDoc(collection(db, "outlets"), {
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          createdAt: serverTimestamp(),
        });
      }

      setIsModalOpen(false);
      setName("");
      setAddress("");
      setPhone("");
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save outlet to Firebase:", err);
      alert("Failed to save outlet. Please check your network connection.");
    } finally {
      setSaving(false);
    }
  };

  // Custom Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteOutlet = (id: string, outletName: string) => {
    setDeleteTarget({ id, name: outletName });
  };

  const handleConfirmDeleteOutlet = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "outlets", deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete outlet:", err);
      alert("Failed to delete outlet.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredOutlets = outlets.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer
      title="Outlets"
      subtitle="Manage multiple Brother's Fitness gym branches and location addresses"
      actionText="Add Outlet"
      onActionClick={handleOpenAddModal}
    >
      {/* Top Stat Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Gym Outlets
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {outlets.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Active Branches
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Locations
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {outlets.length}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Cities / Areas
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
              <CheckCircle2 className="h-4 w-4" /> Live Sync
            </span>
            <span className="text-[11px] font-medium text-zinc-400">Connected</span>
          </div>
        </div>
      </div>

      {/* Main Table / Grid Container */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 px-5 py-3 gap-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Gym Outlets List
            </span>
            <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-400/30">
              {outlets.length} Branches
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-56 rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-medium outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500 mb-2" />
            <span className="text-xs text-zinc-500 font-medium">
              Loading outlets from Firebase...
            </span>
          </div>
        ) : filteredOutlets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-400/30">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {searchQuery ? "No matching outlets found" : "No Gym Outlets Added Yet"}
            </h3>
            <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              Click the Add Outlet button to register your gym locations and branch addresses.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Outlet Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Outlet Name</th>
                  <th className="px-5 py-3 font-semibold">Address</th>
                  <th className="px-5 py-3 font-semibold">Contact Phone</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredOutlets.map((outlet) => (
                  <tr
                    key={outlet.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 text-amber-700 dark:text-amber-400 border border-amber-400/20 font-semibold">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                          {outlet.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300 font-medium max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{outlet.address}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300 font-medium">
                      {outlet.phone ? (
                        <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                          <Phone className="h-3 w-3 text-zinc-400" />
                          {outlet.phone}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(outlet)}
                          className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
                          title="Edit Outlet"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOutlet(outlet.id, outlet.name)}
                          className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400 transition-colors"
                          title="Delete Outlet"
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

      {/* Add / Edit Outlet Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-black">
                  <Building2 className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingId ? "Edit Gym Outlet" : "Add New Gym Outlet"}
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
            <form onSubmit={handleSaveOutlet} className="mt-4 flex flex-col gap-4">
              {/* Outlet Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Outlet Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brother's Fitness - Anna Nagar Branch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Branch Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter full gym address, street name, area, city..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400 resize-none"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                />
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
                      <span>Save Outlet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Gym Branch Outlet"
        message={`Are you sure you want to delete outlet branch "${deleteTarget?.name}"?`}
        loading={deleting}
        onConfirm={handleConfirmDeleteOutlet}
        onClose={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
