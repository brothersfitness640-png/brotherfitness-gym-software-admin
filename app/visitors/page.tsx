"use client";

import { useState, useEffect, useMemo } from "react";
import PageContainer from "@/components/PageContainer";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useToast } from "@/components/ToastProvider";
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
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  Loader2,
  Filter,
  User,
  Clock,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type VisitorStatus =
  | "Visited"
  | "Interested"
  | "Awaiting Visitor Response"
  | "Done"
  | "Not Interested";

export interface VisitorRecord {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  status: VisitorStatus;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

const STATUS_OPTIONS: VisitorStatus[] = [
  "Visited",
  "Interested",
  "Awaiting Visitor Response",
  "Done",
  "Not Interested",
];

export default function VisitorsPage() {
  const toast = useToast();

  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 45;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields State
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<VisitorStatus>("Visited");
  const [description, setDescription] = useState("");

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // 1. Subscribe to Visitors Collection from Firestore
  useEffect(() => {
    const q = query(collection(db, "visitors"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as VisitorRecord[];
        setVisitors(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching visitors:", err);
        toast.error("Failed to load visitors list");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Open Modal for Create
  const handleOpenAddModal = () => {
    setEditingId(null);
    setName("");
    setMobile("");
    setEmail("");
    setAddress("");
    setStatus("Visited");
    setDescription("");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (v: VisitorRecord) => {
    setEditingId(v.id);
    setName(v.name || "");
    setMobile(v.mobile || "");
    setEmail(v.email || "");
    setAddress(v.address || "");
    setStatus(v.status || "Visited");
    setDescription(v.description || "");
    setIsModalOpen(true);
  };

  // Form Submission Handler with Duplicate Mobile Check
  const handleSaveVisitor = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedMobile || !trimmedAddress) {
      toast.warning("Please fill in required fields (Name, Mobile, Address)");
      return;
    }

    // DUPLICATE MOBILE CHECK: Check if mobile number already exists in database
    const existingDuplicate = visitors.find(
      (v) => v.mobile.trim() === trimmedMobile && v.id !== editingId
    );

    if (existingDuplicate) {
      toast.error("Visitor already found");
      return;
    }

    setSaving(true);
    try {
      const visitorData = {
        name: trimmedName,
        mobile: trimmedMobile,
        email: email.trim() || "",
        address: trimmedAddress,
        status: status,
        description: description.trim() || "",
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "visitors", editingId), visitorData);
        toast.success(`Visitor record for ${trimmedName} updated successfully`);
      } else {
        await addDoc(collection(db, "visitors"), {
          ...visitorData,
          createdAt: serverTimestamp(),
        });
        toast.success(`Visitor ${trimmedName} added successfully!`);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving visitor:", err);
      toast.error("Failed to save visitor record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Visitor Handler
  const handleDeleteVisitor = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDoc(doc(db, "visitors", deleteTarget.id));
      toast.success(`Visitor ${deleteTarget.name} deleted successfully`);
    } catch (err) {
      console.error("Error deleting visitor:", err);
      toast.error("Failed to delete visitor record.");
    } finally {
      setDeleteTarget(null);
    }
  };

  // Filter Visitors by Search Term and Status Filter
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      // Status Filter
      if (statusFilter !== "all" && v.status !== statusFilter) return false;

      // Search Query
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();

      return (
        v.name?.toLowerCase().includes(term) ||
        v.mobile?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term) ||
        v.address?.toLowerCase().includes(term) ||
        v.status?.toLowerCase().includes(term) ||
        v.description?.toLowerCase().includes(term)
      );
    });
  }, [visitors, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVisitors = filteredVisitors.slice(startIndex, startIndex + itemsPerPage);

  // Status Badge Colors Helper
  const getStatusBadgeStyle = (st: VisitorStatus) => {
    switch (st) {
      case "Visited":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Interested":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "Awaiting Visitor Response":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
      case "Done":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Not Interested":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <PageContainer
      title="Visitor Inquiries & Leads"
      subtitle="Track gym visitors, follow-up statuses, and visitor inquiry details"
      actionText="Add Visitor"
      onActionClick={handleOpenAddModal}
    >
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-6">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search visitor name, mobile, address, status, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-9 pr-4 py-2 text-xs font-medium text-zinc-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
            <Filter className="h-3.5 w-3.5 ml-2 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none pr-2 cursor-pointer py-1"
            >
              <option value="all" className="dark:bg-zinc-900">
                All Statuses ({visitors.length})
              </option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st} className="dark:bg-zinc-900">
                  {st} ({visitors.filter((v) => v.status === st).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VISITORS TABLE / LIST CONTAINER */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-amber-500" />
            <span className="text-xs font-semibold">Loading visitor records...</span>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500 mb-3">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {searchTerm || statusFilter !== "all"
                ? "No visitors matching your filter"
                : "No Visitors Registered Yet"}
            </h3>
            <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search terms or clearing status filters."
                : "Click the button below to register new gym visitors, track inquiry notes, and manage follow-up statuses."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-500 transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Visitor</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Mobile & Tablet Card View (< md) */}
            <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedVisitors.map((v) => (
                <div
                  key={v.id}
                  className="p-4 flex flex-col gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-400/20">
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{v.name}</h4>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          Added: {v.createdAt?.toDate ? v.createdAt.toDate().toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadgeStyle(
                        v.status
                      )}`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-zinc-700 dark:text-zinc-300">
                    <div className="flex items-center justify-between">
                      <a
                        href={`tel:${v.mobile}`}
                        className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{v.mobile}</span>
                      </a>

                      {v.email && (
                        <span className="text-[11px] text-zinc-500 truncate max-w-[140px]">{v.email}</span>
                      )}
                    </div>

                    <div className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-400 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{v.address}</span>
                    </div>

                    {v.description && (
                      <div className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-400 mt-1">
                        <MessageSquare className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{v.description}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => handleOpenEditModal(v)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                      title="Edit Visitor"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: v.id, name: v.name })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-rose-600 dark:border-zinc-700 dark:text-rose-400"
                      title="Delete Visitor"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Visitor Details</th>
                    <th className="px-5 py-3.5 font-bold">Mobile & Contact</th>
                    <th className="px-5 py-3.5 font-bold">Address</th>
                    <th className="px-5 py-3.5 font-bold">Status</th>
                    <th className="px-5 py-3.5 font-bold">Description / Notes</th>
                    <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedVisitors.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-400/20">
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs block">
                              {v.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              Added: {v.createdAt?.toDate ? v.createdAt.toDate().toLocaleDateString() : "Recent"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mobile & Email */}
                      <td className="px-5 py-4 font-medium">
                        <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold">
                          <Phone className="h-3.5 w-3.5 text-amber-500" />
                          <span>{v.mobile}</span>
                        </div>
                        {v.email ? (
                          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mt-1 text-[11px]">
                            <Mail className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="truncate max-w-[140px]">{v.email}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 mt-0.5 block italic">No email</span>
                        )}
                      </td>

                      {/* Address */}
                      <td className="px-5 py-4 max-w-[180px]">
                        <div className="flex items-start gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{v.address}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border ${getStatusBadgeStyle(
                            v.status
                          )}`}
                        >
                          {v.status}
                        </span>
                      </td>

                      {/* Description / Notes */}
                      <td className="px-5 py-4 max-w-[240px]">
                        {v.description ? (
                          <div className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-400 text-xs">
                            <MessageSquare className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{v.description}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">No description provided</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(v)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-400 transition-colors"
                            title="Edit Visitor"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: v.id, name: v.name })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
                            title="Delete Visitor"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Showing <strong className="text-zinc-900 dark:text-zinc-100">{startIndex + 1}</strong> to{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">{Math.min(startIndex + itemsPerPage, filteredVisitors.length)}</strong> of{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">{filteredVisitors.length}</strong> visitors
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

      {/* --- ADD / EDIT VISITOR MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {editingId ? "Edit Visitor Information" : "Register New Visitor"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVisitor} className="mt-4 flex flex-col gap-4">
              {/* Visitor Name & Mobile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Visitor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email (Optional) & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Inquiry / Visitor Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VisitorStatus)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-bold dark:bg-zinc-800 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Visited">Visited</option>
                    <option value="Interested">Interested</option>
                    <option value="Awaiting Visitor Response">Awaiting Visitor Response</option>
                    <option value="Done">Done</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Address / Residence Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Green Valley Towers, Hyderabad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Description / Inquiry Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description / Inquiry Details & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Inquired about 6-month weight loss membership plan and personal trainer availability..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 p-3 text-xs font-medium dark:bg-zinc-800 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="mt-2 flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-5 py-2 text-xs font-bold text-black hover:bg-amber-500 transition-colors shadow-xs"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>{editingId ? "Update Visitor" : "Save Visitor"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Visitor Record"
        message={`Are you sure you want to delete visitor record for "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteVisitor}
        onClose={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
