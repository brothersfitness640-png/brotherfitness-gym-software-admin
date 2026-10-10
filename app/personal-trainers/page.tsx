"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Users,
  ShieldAlert,
  Calendar,
  Building2,
  Layers,
  Clock,
  ExternalLink,
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

export interface AssignedClientItem {
  assignmentId: string;
  clientId: string;
  clientName: string;
  clientMobile: string;
  clientEmail?: string;
  clientOutletName?: string;
  clientPlanName?: string;
  clientPhotoUrl?: string;
  assignedAt?: any;
  isCurrentTrainer: boolean;
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

  // Assigned Clients Modal State
  const [clientsModalTrainer, setClientsModalTrainer] = useState<PersonalTrainer | null>(null);
  const [clientsSearchQuery, setClientsSearchQuery] = useState("");
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);

  // 1. Realtime Firestore Listener for Trainers
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

  // 2. Realtime Listener for Clients Collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "clients"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setClientsList(list);
    });
    return () => unsub();
  }, []);

  // 3. Realtime Listener for All Client Trainer Assignments across all clients
  useEffect(() => {
    let unsub = () => {};
    try {
      const trainersQuery = collectionGroup(db, "trainers");
      unsub = onSnapshot(
        trainersQuery,
        (snapshot) => {
          const list = snapshot.docs.map((d) => {
            const data = d.data();
            const parentClientId = d.ref.parent.parent?.id || "";
            return {
              id: d.id,
              clientId: parentClientId,
              trainerId: data.trainerId || "",
              name: data.name || "",
              mobile: data.mobile || "",
              email: data.email || "",
              assignedAt: data.assignedAt || data.createdAt,
            };
          });
          setAllAssignments(list);
        },
        (err) => {
          console.warn("trainers collectionGroup listener fallback:", err);
        }
      );
    } catch (err) {
      console.warn("trainers collectionGroup setup error:", err);
    }
    return () => unsub();
  }, []);

  // Compute assigned clients for any trainer
  const getTrainerClients = (trainerId: string, trainerName: string): AssignedClientItem[] => {
    const matching = allAssignments.filter(
      (a) =>
        (a.trainerId && a.trainerId === trainerId) ||
        (!a.trainerId && a.name && a.name.toLowerCase() === trainerName.toLowerCase())
    );

    // Find the latest assignment per client across all trainers
    const clientLatestTrainerMap: Record<string, any> = {};
    allAssignments.forEach((a) => {
      if (!a.clientId) return;
      const cur = clientLatestTrainerMap[a.clientId];
      const curTime = cur?.assignedAt?.toMillis?.() || cur?.assignedAt?.seconds * 1000 || 0;
      const thisTime = a.assignedAt?.toMillis?.() || a.assignedAt?.seconds * 1000 || 0;
      if (!cur || thisTime > curTime) {
        clientLatestTrainerMap[a.clientId] = a;
      }
    });

    const result: AssignedClientItem[] = [];
    const seenClientIds = new Set<string>();

    // Sort matching assignments descending by assignment date
    const sorted = [...matching].sort((a, b) => {
      const aTime = a.assignedAt?.toMillis?.() || a.assignedAt?.seconds * 1000 || 0;
      const bTime = b.assignedAt?.toMillis?.() || b.assignedAt?.seconds * 1000 || 0;
      return bTime - aTime;
    });

    sorted.forEach((a) => {
      if (!a.clientId || seenClientIds.has(a.clientId)) return;
      seenClientIds.add(a.clientId);

      const client = clientsList.find((c) => c.id === a.clientId);
      const latestForThisClient = clientLatestTrainerMap[a.clientId];
      const isCurrent =
        latestForThisClient &&
        ((latestForThisClient.trainerId && latestForThisClient.trainerId === trainerId) ||
          (!latestForThisClient.trainerId &&
            latestForThisClient.name?.toLowerCase() === trainerName.toLowerCase()));

      result.push({
        assignmentId: a.id,
        clientId: a.clientId,
        clientName: client?.name || a.clientName || "Gym Client",
        clientMobile: client?.mobile || a.clientMobile || "-",
        clientEmail: client?.email || "",
        clientOutletName: client?.outletName || "-",
        clientPlanName: client?.planName || "-",
        clientPhotoUrl: client?.photoUrl || "",
        assignedAt: a.assignedAt,
        isCurrentTrainer: Boolean(isCurrent),
      });
    });

    return result;
  };

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

  const handleOpenAssignedClientsModal = (t: PersonalTrainer) => {
    setClientsModalTrainer(t);
    setClientsSearchQuery("");
  };

  const handleCloseAssignedClientsModal = () => {
    setClientsModalTrainer(null);
    setClientsSearchQuery("");
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

  // Filter Trainers
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

  // Clients assigned to the trainer in the modal
  const assignedClientsForModal = useMemo(() => {
    if (!clientsModalTrainer) return [];
    const list = getTrainerClients(clientsModalTrainer.id, clientsModalTrainer.name);
    const q = clientsSearchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.clientName.toLowerCase().includes(q) ||
        c.clientMobile.toLowerCase().includes(q) ||
        c.clientOutletName?.toLowerCase().includes(q) ||
        c.clientPlanName?.toLowerCase().includes(q)
    );
  }, [clientsModalTrainer, clientsSearchQuery, allAssignments, clientsList]);

  return (
    <PageContainer
      title="Personal Trainers"
      subtitle="Manage fitness instructors, contact details, and their client assignments"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-zinc-200 bg-linear-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5 dark:border-zinc-800 dark:from-amber-500/10 dark:via-zinc-900 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black shadow-md shadow-amber-400/20">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Personal Trainers
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Register personal instructors and assign them to clients
                </p>
              </div>
            </div>

            {editable && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-black shadow-xs hover:bg-amber-500 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Add Trainer</span>
              </button>
            )}
          </div>
        </div>

        {/* View-Only Alert for restricted staff */}
        {!editable && (
          <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-50/50 p-3.5 text-xs text-blue-700 dark:bg-blue-950/20 dark:text-blue-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-blue-500" />
            <span>
              <strong>View-Only Mode:</strong> Your account has view permissions for Personal Trainers.
            </span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Total Trainers
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {trainers.length}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Active</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Total Assignments
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {allAssignments.length}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Client Ties</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Contact Verified
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {trainers.filter((t) => t.mobile).length}
              </span>
              <span className="text-xs text-zinc-500">With Mobile</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-xs font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-zinc-500 font-medium self-end sm:self-center">
            Showing {filteredTrainers.length} of {trainers.length} trainers
          </span>
        </div>

        {/* Trainer Content */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-xs text-zinc-500 font-medium">Loading personal trainers...</p>
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-600 mb-3">
              <Dumbbell className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {searchQuery ? "No matching personal trainers found" : "No Personal Trainers Added Yet"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              {searchQuery
                ? `No trainers match your query "${searchQuery}". Clear search to view all.`
                : "Add personal fitness instructors so they can be assigned to clients in the Client Details page."}
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
              {paginatedTrainers.map((t) => {
                const clientCount = getTrainerClients(t.id, t.name).length;
                return (
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

                      <div className="flex items-center gap-1">
                        {/* Users / Assigned Clients Button */}
                        <button
                          onClick={() => handleOpenAssignedClientsModal(t)}
                          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300 cursor-pointer"
                          title="View Assigned Clients"
                        >
                          <Users className="h-3.5 w-3.5" />
                        </button>
                        {editable && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(t)}
                              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 cursor-pointer"
                              title="Edit Trainer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: t.id, name: t.name })}
                              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 cursor-pointer"
                              title="Delete Trainer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
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
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-zinc-500">Assigned Clients:</span>
                        <button
                          onClick={() => handleOpenAssignedClientsModal(t)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer"
                        >
                          <Users className="h-3 w-3" />
                          <span>{clientCount} {clientCount === 1 ? "Client" : "Clients"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table ( >= md ) */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Trainer Name</th>
                    <th className="px-5 py-3.5 font-bold">Mobile Number</th>
                    <th className="px-5 py-3.5 font-bold">Email Address</th>
                    <th className="px-5 py-3.5 font-bold">Assigned Clients</th>
                    <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedTrainers.map((t) => {
                    const clientCount = getTrainerClients(t.id, t.name).length;
                    return (
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
                                Personal Trainer
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
                          <button
                            onClick={() => handleOpenAssignedClientsModal(t)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            title="Click to view client list"
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>{clientCount} {clientCount === 1 ? "Client" : "Clients"}</span>
                          </button>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* User / Assigned Clients Button */}
                            <button
                              onClick={() => handleOpenAssignedClientsModal(t)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                              title="View Assigned Clients"
                            >
                              <Users className="h-3.5 w-3.5" />
                            </button>

                            {editable && (
                              <>
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
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT TRAINER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {editingId ? "Edit Personal Trainer" : "Add New Trainer"}
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    {editingId
                      ? "Update trainer contact information"
                      : "Enter trainer name, mobile, and optional email"}
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
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingId ? "Update Trainer" : "Save Trainer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGNED CLIENTS TO TRAINER */}
      {clientsModalTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {clientsModalTrainer.name}
                    </h2>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      Personal Trainer
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-zinc-400" />
                      {clientsModalTrainer.mobile}
                    </span>
                    {clientsModalTrainer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-zinc-400" />
                        {clientsModalTrainer.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseAssignedClientsModal}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Subheader with Count & Search */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Assigned Members:
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-black">
                  {assignedClientsForModal.length} {assignedClientsForModal.length === 1 ? "Client" : "Clients"}
                </span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search client name, mobile..."
                  value={clientsSearchQuery}
                  onChange={(e) => setClientsSearchQuery(e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white pl-8.5 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                {clientsSearchQuery && (
                  <button
                    onClick={() => setClientsSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body: Client List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {assignedClientsForModal.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 mb-2">
                    <User className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {clientsSearchQuery
                      ? "No clients match your search query"
                      : "No Clients Assigned Yet"}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                    {clientsSearchQuery
                      ? "Try searching with a different name or mobile number."
                      : "To assign this personal trainer to a member, open the member's profile in the Clients directory and assign from the Trainers tab."}
                  </p>
                </div>
              ) : (
                assignedClientsForModal.map((c) => {
                  let dateStr = "";
                  if (c.assignedAt) {
                    try {
                      const d =
                        typeof c.assignedAt.toDate === "function"
                          ? c.assignedAt.toDate()
                          : new Date(c.assignedAt);
                      dateStr = d.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    } catch {
                      dateStr = "";
                    }
                  }

                  return (
                    <div
                      key={c.assignmentId || c.clientId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-400/50 transition-colors shadow-2xs"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        {c.clientPhotoUrl ? (
                          <img
                            src={c.clientPhotoUrl}
                            alt={c.clientName}
                            className="h-10 w-10 shrink-0 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700 font-bold text-sm border border-amber-400/30">
                            {c.clientName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                              {c.clientName}
                            </span>
                            {c.isCurrentTrainer && (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Active / Current
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                            {c.clientMobile && c.clientMobile !== "-" && (
                              <a
                                href={`tel:${c.clientMobile}`}
                                className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                <span>{c.clientMobile}</span>
                              </a>
                            )}
                            {c.clientOutletName && c.clientOutletName !== "-" && (
                              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                <Building2 className="h-3 w-3 text-zinc-400" />
                                <span>{c.clientOutletName}</span>
                              </span>
                            )}
                            {c.clientPlanName && c.clientPlanName !== "-" && (
                              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                <Layers className="h-3 w-3 text-zinc-400" />
                                <span>{c.clientPlanName}</span>
                              </span>
                            )}
                            {dateStr && (
                              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                                <Clock className="h-3 w-3" />
                                <span>Assigned: {dateStr}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/clients/${c.clientId}`}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-amber-400 hover:text-black hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-amber-400 dark:hover:text-black transition-colors self-end sm:self-center shrink-0 cursor-pointer"
                      >
                        <span>View Client</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
              <button
                type="button"
                onClick={handleCloseAssignedClientsModal}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
            </div>
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
