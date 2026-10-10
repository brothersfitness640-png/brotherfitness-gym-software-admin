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
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  Search,
  Loader2,
  Sparkles,
  Phone,
  Mail,
  User,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export interface PersonalTrainer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function PersonalTrainersPage() {
  const { canEdit } = useAuth();
  const editable = canEdit("/personal-trainers");

  const [trainers, setTrainers] = useState<PersonalTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Custom Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Realtime Firestore Listener
  useEffect(() => {
    const trainersRef = collection(db, "personal_trainers");
    const q = query(trainersRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as PersonalTrainer[];
        setTrainers(fetched);
        setLoading(false);
      },
      (error) => {
        console.warn("Personal trainers query fallback:", error);
        onSnapshot(trainersRef, (snapshot) => {
          const fetched = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as PersonalTrainer[];
          setTrainers(fetched);
          setLoading(false);
        });
      }
    );

    return () => unsub();
  }, []);

  const handleOpenAddModal = () => {
    if (!editable) return;
    setEditingId(null);
    setName("");
    setMobile("");
    setEmail("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: PersonalTrainer) => {
    if (!editable) return;
    setEditingId(t.id);
    setName(t.name);
    setMobile(t.mobile);
    setEmail(t.email || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedMobile) {
      alert("Please provide Trainer Name and Mobile Number.");
      return;
    }

    setSaving(true);
    try {
      const trainerData = {
        name: trimmedName,
        mobile: trimmedMobile,
        email: trimmedEmail || null,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "personal_trainers", editingId), trainerData);
      } else {
        await addDoc(collection(db, "personal_trainers"), {
          ...trainerData,
          createdAt: serverTimestamp(),
        });
      }

      handleCloseModal();
    } catch (err: any) {
      console.error("Error saving personal trainer:", err);
      alert("Failed to save trainer details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !editable) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "personal_trainers", deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting trainer:", err);
      alert("Failed to delete trainer.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered List
  const filteredTrainers = trainers.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.mobile.toLowerCase().includes(q) ||
      (t.email && t.email.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage) || 1;
  const paginatedTrainers = filteredTrainers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PageContainer
      title="Personal Trainers"
      subtitle="Manage certified personal trainers and gym fitness instructors"
      actionText={editable ? "Add Trainer" : undefined}
      onActionClick={handleOpenAddModal}
    >
      <div className="space-y-6">
        {/* Permission Notice if View-Only */}
        {!editable && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
            <span>You have view-only access for personal trainers. Modifications are restricted.</span>
          </div>
        )}

        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search trainer by name, mobile, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9.5 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-xs font-medium text-zinc-900 outline-none transition-colors focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-amber-400 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 shadow-xs">
              Total Trainers: <strong className="text-amber-600 dark:text-amber-400">{trainers.length}</strong>
            </span>
          </div>
        </div>

        {/* Content Container */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="text-xs font-semibold text-zinc-500">Loading personal trainers...</span>
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50 shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-600 dark:text-amber-400 mb-3">
              <Dumbbell className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No Personal Trainers Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-4">
              {searchQuery
                ? `No trainers match your search "${searchQuery}".`
                : "No personal trainers have been registered yet. Add trainers to assign them to gym clients."}
            </p>
            {editable && !searchQuery && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black shadow-xs hover:bg-amber-500 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Trainer Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile Cards ( < md ) */}
            <div className="grid gap-3 sm:grid-cols-2 md:hidden">
              {paginatedTrainers.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700 font-bold text-sm border border-amber-400/30">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {t.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                          <Dumbbell className="h-2.5 w-2.5" />
                          Personal Trainer
                        </span>
                      </div>
                    </div>

                    {editable && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: t.id, name: t.name })}
                          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Mobile:</span>
                      <a
                        href={`tel:${t.mobile}`}
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        {t.mobile}
                      </a>
                    </div>
                    {t.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Email:</span>
                        <a
                          href={`mailto:${t.email}`}
                          className="font-medium text-zinc-700 dark:text-zinc-300 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                        >
                          <Mail className="h-3 w-3 text-zinc-400" />
                          {t.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table ( >= md ) */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Trainer Name</th>
                    <th className="px-5 py-3.5 font-bold">Mobile Number</th>
                    <th className="px-5 py-3.5 font-bold">Email Address</th>
                    <th className="px-5 py-3.5 font-bold">Designation</th>
                    <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedTrainers.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-amber-400/5 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700 font-bold text-xs border border-amber-400/30">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm block">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              ID: {t.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <a
                          href={`tel:${t.mobile}`}
                          className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{t.mobile}</span>
                        </a>
                      </td>

                      <td className="px-5 py-3.5">
                        {t.email ? (
                          <a
                            href={`mailto:${t.email}`}
                            className="font-medium text-zinc-700 dark:text-zinc-300 hover:underline flex items-center gap-1.5"
                          >
                            <Mail className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{t.email}</span>
                          </a>
                        ) : (
                          <span className="text-zinc-400 italic">Not provided</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-400/30">
                          <Dumbbell className="h-3 w-3" />
                          Personal Trainer
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {editable ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(t)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Edit Trainer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: t.id, name: t.name })}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                              title="Delete Trainer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">View only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT TRAINER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-black shadow-xs font-bold">
                  <Dumbbell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {editingId ? "Edit Personal Trainer" : "Add Personal Trainer"}
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    {editingId ? "Update trainer contact information" : "Enter trainer name, mobile, and optional email"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrainer} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Trainer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-zinc-500">
                    <Phone className="h-3.5 w-3.5 text-amber-500" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-16 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="e.g. vikram@fitness.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black hover:bg-amber-500 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>{editingId ? "Update Trainer" : "Save Trainer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Personal Trainer"
        message={`Are you sure you want to delete personal trainer "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </PageContainer>
  );
}
