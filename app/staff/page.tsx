"use client";

import { useState, useEffect, useRef } from "react";
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
  UserCog,
  Plus,
  Search,
  Upload,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  Camera,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Phone,
  KeyRound,
  ShieldAlert,
  Check,
  RefreshCw,
  Sparkles,
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  Layers,
  Package,
  UserCheck,
  BadgeIndianRupee,
  HelpCircle,
  Settings,
  QrCode,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export interface PortalStaffMember {
  id: string;
  name: string;
  mobile: string;
  mpin: string;
  photoUrl?: string;
  assignedOutlets: string[];
  assignedOutletNames?: string[];
  permissions: Record<string, "view" | "edit" | "none">;
  createdAt?: any;
  updatedAt?: any;
}

interface OutletItem {
  id: string;
  name: string;
}

export const SYSTEM_MODULES = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/outlets", label: "Gym Outlets", icon: Building2 },
  { path: "/outlets-qr", label: "Outlets QR Code", icon: QrCode },
  { path: "/clients", label: "Clients Directory", icon: Users },
  { path: "/visitors", label: "Visitors & Inquiries", icon: UserPlus },
  { path: "/client-attendance", label: "Client Attendance", icon: CalendarCheck },
  { path: "/plans", label: "Membership Plans", icon: Layers },
  { path: "/products", label: "Products & Store", icon: Package },
  { path: "/employees", label: "Employees Directory", icon: UserCheck },
  { path: "/staff", label: "Staff Management", icon: UserCog },
  { path: "/payroll", label: "Payroll & Salaries", icon: BadgeIndianRupee },
  { path: "/support", label: "Support & Contact", icon: HelpCircle },
  { path: "/settings", label: "System Settings", icon: Settings },
];

export default function StaffManagementPage() {
  const { canEdit } = useAuth();
  const editable = canEdit("/staff");

  const [staffList, setStaffList] = useState<PortalStaffMember[]>([]);
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutletFilter, setSelectedOutletFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [mpin, setMpin] = useState("");
  const [showMpinInForm, setShowMpinInForm] = useState(false);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Record<string, "view" | "edit" | "none">>({});

  // Pin reveal toggle for table rows
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  // Camera & Photo State
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Outlets
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

  // 2. Fetch Portal Staff Real-Time
  useEffect(() => {
    const staffRef = collection(db, "portal_staff");
    const q = query(staffRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as PortalStaffMember[];
        setStaffList(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Portal staff query fallback:", err);
        onSnapshot(staffRef, (snapshot) => {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as PortalStaffMember[];
          setStaffList(list);
          setLoading(false);
        });
      }
    );
    return () => unsub();
  }, []);

  // Camera Handlers
  const startCamera = async (mode: "user" | "environment" = cameraFacingMode) => {
    setCameraError("");
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: mode },
        audio: false,
      });
      streamRef.current = mediaStream;
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or camera not available.");
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacingMode = async () => {
    const newMode = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(newMode);
    await startCamera(newMode);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Modal Helpers
  const handleOpenAddModal = () => {
    if (!editable) return;
    setEditingStaffId(null);
    setName("");
    setMobile("");
    setMpin("");
    setShowMpinInForm(false);
    setSelectedOutlets(outlets.map((o) => o.id)); // default all outlets selected
    
    // Default initial permissions
    const initPerms: Record<string, "view" | "edit" | "none"> = {};
    SYSTEM_MODULES.forEach((m) => {
      initPerms[m.path] = "view";
    });
    setPermissions(initPerms);
    setCapturedPhoto(null);
    stopCamera();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: PortalStaffMember) => {
    if (!editable) return;
    setEditingStaffId(staff.id);
    setName(staff.name);
    setMobile(staff.mobile);
    setMpin(staff.mpin);
    setShowMpinInForm(false);
    setSelectedOutlets(staff.assignedOutlets || []);
    
    // Ensure all modules are represented in permissions object
    const currentPerms: Record<string, "view" | "edit" | "none"> = {};
    SYSTEM_MODULES.forEach((m) => {
      currentPerms[m.path] = staff.permissions?.[m.path] || "none";
    });
    setPermissions(currentPerms);
    setCapturedPhoto(staff.photoUrl || null);
    stopCamera();
    setIsModalOpen(true);
  };

  // Outlet toggle in form
  const handleToggleOutlet = (outletId: string) => {
    if (selectedOutlets.includes(outletId)) {
      setSelectedOutlets(selectedOutlets.filter((id) => id !== outletId));
    } else {
      setSelectedOutlets([...selectedOutlets, outletId]);
    }
  };

  // Permission presets
  const handleSetAllPermissions = (level: "view" | "edit" | "none") => {
    const updated: Record<string, "view" | "edit" | "none"> = {};
    SYSTEM_MODULES.forEach((m) => {
      updated[m.path] = level;
    });
    setPermissions(updated);
  };

  // Save Staff
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.trim().replace(/\D/g, "");
    const cleanMpin = mpin.trim();

    if (!name.trim()) {
      alert("Please enter staff member name.");
      return;
    }
    if (!cleanMobile || cleanMobile.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!cleanMpin || cleanMpin.length < 4) {
      alert("Please enter an MPIN with at least 4 digits.");
      return;
    }
    if (selectedOutlets.length === 0) {
      alert("Please select at least one outlet branch for this staff member.");
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUrl = capturedPhoto || "";

      // Upload live captured photo to ImageKit
      if (capturedPhoto && capturedPhoto.startsWith("data:image")) {
        const formData = new FormData();
        formData.append("file", capturedPhoto);
        formData.append(
          "fileName",
          `staff_${cleanMobile}_${Date.now()}.jpg`
        );

        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalPhotoUrl = uploadData.url || finalPhotoUrl;
        }
      }

      const assignedOutletNames = outlets
        .filter((o) => selectedOutlets.includes(o.id))
        .map((o) => o.name);

      const staffData = {
        name: name.trim(),
        mobile: cleanMobile,
        mpin: cleanMpin,
        photoUrl: finalPhotoUrl,
        assignedOutlets: selectedOutlets,
        assignedOutletNames: assignedOutletNames,
        permissions: permissions,
        updatedAt: serverTimestamp(),
      };

      if (editingStaffId) {
        await updateDoc(doc(db, "portal_staff", editingStaffId), staffData);
      } else {
        await addDoc(collection(db, "portal_staff"), {
          ...staffData,
          createdAt: serverTimestamp(),
        });
      }

      stopCamera();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving portal staff:", err);
      alert("Failed to save staff member: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "portal_staff", deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Failed to delete staff member.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered List
  const filteredStaff = staffList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobile.includes(searchQuery);

    if (!matchSearch) return false;

    if (
      selectedOutletFilter !== "all" &&
      !s.assignedOutlets.includes(selectedOutletFilter)
    ) {
      return false;
    }
    return true;
  });

  return (
    <PageContainer
      title="Staff & Role Permissions"
      subtitle="Manage portal staff logins, assigned branch outlets, mobile MPIN, and module access permissions"
      actionText={editable ? "+ Add Staff Member" : undefined}
      onActionClick={editable ? handleOpenAddModal : undefined}
    >
      {!editable && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span><strong>View-Only Mode:</strong> Your staff account has view permissions for Staff Management. Creating, modifying, or deleting staff accounts and permissions is restricted.</span>
        </div>
      )}

      {/* Top Stat Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Portal Staff
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <UserCog className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {staffList.length}
            </span>
            <span className="text-xs font-semibold text-zinc-400">Staff Accounts</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Outlets Connected
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {outlets.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Active Branches
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Security Protocol
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10 text-sky-600 dark:text-sky-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              MPIN Auth
            </span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 px-5 py-3.5 gap-3 dark:border-zinc-800">
          {/* Branch Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedOutletFilter("all")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedOutletFilter === "all"
                  ? "bg-amber-400 text-black shadow-xs font-bold"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              All Outlets ({staffList.length})
            </button>

            {outlets.map((o) => {
              const count = staffList.filter((s) =>
                s.assignedOutlets.includes(o.id)
              ).length;
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedOutletFilter(o.id)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    selectedOutletFilter === o.id
                      ? "bg-amber-400 text-black shadow-xs font-bold"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {o.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search & Add */}
          <div className="flex items-center gap-2">
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

            {editable && (
              <button
                onClick={handleOpenAddModal}
                className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 text-xs font-bold text-black hover:bg-amber-500 shadow-md transition-transform active:scale-98"
              >
                <Plus className="h-4 w-4" />
                <span>Add Staff</span>
              </button>
            )}
          </div>
        </div>

        {/* Staff Table / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
            <span className="text-xs font-semibold text-zinc-500">
              Loading staff accounts...
            </span>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-400/30">
              <UserCog className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No Staff Accounts Found
            </h3>
            <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              Create staff accounts with designated branch outlets, MPIN security, and module-specific access.
            </p>
            {editable && (
              <button
                onClick={handleOpenAddModal}
                className="cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-black shadow-md hover:bg-amber-500"
              >
                + Add First Staff Member
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3">Staff Member</th>
                  <th className="px-4 py-3">Mobile & MPIN</th>
                  <th className="px-4 py-3">Assigned Outlets</th>
                  <th className="px-4 py-3">Module Access</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredStaff.map((staff) => {
                  const allowedPages = Object.entries(staff.permissions || {}).filter(
                    ([_, p]) => p === "view" || p === "edit"
                  );
                  const editPages = allowedPages.filter(([_, p]) => p === "edit");
                  const isPinRevealed = revealedPins[staff.id];

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Photo & Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-amber-400 bg-amber-400/10">
                            {staff.photoUrl ? (
                              <img
                                src={staff.photoUrl}
                                alt={staff.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-amber-700">
                                {staff.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                              {staff.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium">
                              Staff Portal User
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mobile & MPIN */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                            <Phone className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{staff.mobile}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                              MPIN: {isPinRevealed ? staff.mpin : "••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedPins((prev) => ({
                                  ...prev,
                                  [staff.id]: !prev[staff.id],
                                }))
                              }
                              className="cursor-pointer text-zinc-400 hover:text-zinc-600"
                              title={isPinRevealed ? "Hide MPIN" : "Reveal MPIN"}
                            >
                              {isPinRevealed ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Outlets Multi-Select */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {staff.assignedOutlets && staff.assignedOutlets.length > 0 ? (
                            staff.assignedOutlets.map((outletId) => {
                              const oName =
                                outlets.find((o) => o.id === outletId)?.name ||
                                "Branch";
                              return (
                                <span
                                  key={outletId}
                                  className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                                >
                                  <Building2 className="h-2.5 w-2.5 text-amber-500" />
                                  <span>{oName}</span>
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[11px] text-zinc-400">None</span>
                          )}
                        </div>
                      </td>

                      {/* Permissions */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 w-fit">
                            <ShieldCheck className="h-3 w-3" />
                            {allowedPages.length} of {SYSTEM_MODULES.length} Modules Allowed
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {editPages.length} Full Edit • {allowedPages.length - editPages.length} View Only
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        {editable ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(staff)}
                              className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                              title="Edit Staff Member"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({ id: staff.id, name: staff.name })
                              }
                              className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400"
                              title="Delete Staff Member"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs italic">View only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADD / EDIT STAFF MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {editingStaffId ? "Edit Staff Member" : "Add Staff Member"}
                </h3>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setIsModalOpen(false);
                }}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="mt-4 flex flex-col gap-4">
              {/* Photo Box with Camera Flip */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Staff Member Photo (ImageKit CDN)
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40 rounded-xl p-4 text-center">
                  {isCameraActive ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-amber-400 shadow-md bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-amber-500 shadow-xs"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Capture Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={toggleCameraFacingMode}
                          className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
                          <span>
                            {cameraFacingMode === "user"
                              ? "Back Camera"
                              : "Front Camera"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:border-zinc-800"
                        >
                          Cancel Camera
                        </button>
                      </div>
                    </div>
                  ) : capturedPhoto ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-md">
                        <img
                          src={capturedPhoto}
                          alt="Captured"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera(cameraFacingMode)}
                          className="cursor-pointer text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
                        >
                          Retake Camera Photo
                        </button>
                        <label className="cursor-pointer text-xs font-semibold text-zinc-500 hover:underline">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera(cameraFacingMode)}
                          className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-amber-500 shadow-xs"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Take Camera Photo</span>
                        </button>
                        <label className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        Supports front and back camera for tablets and mobile devices
                      </span>
                    </div>
                  )}
                  {cameraError && (
                    <p className="text-xs text-red-500 mt-2 font-medium">{cameraError}</p>
                  )}
                </div>
              </div>

              {/* Basic Fields: Name, Mobile, MPIN */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Staff Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Reddy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mobile Number (Login ID) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-mono font-medium dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Security MPIN (4-6 digits) *
                  </label>
                  <div className="relative">
                    <input
                      type={showMpinInForm ? "text" : "password"}
                      required
                      maxLength={6}
                      placeholder="e.g. 1234"
                      value={mpin}
                      onChange={(e) => setMpin(e.target.value)}
                      className="h-9 w-full rounded-lg border border-zinc-200 px-3 pr-8 text-xs font-mono tracking-widest font-bold dark:bg-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMpinInForm(!showMpinInForm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showMpinInForm ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Outlet Selection (Multi-Select) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Assigned Outlets (Multi-Select) *
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedOutlets(outlets.map((o) => o.id))}
                      className="text-amber-600 hover:underline font-semibold dark:text-amber-400"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedOutlets([])}
                      className="text-zinc-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                  {outlets.map((outlet) => {
                    const isSelected = selectedOutlets.includes(outlet.id);
                    return (
                      <button
                        type="button"
                        key={outlet.id}
                        onClick={() => handleToggleOutlet(outlet.id)}
                        className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-amber-400 text-black shadow-xs font-bold ring-2 ring-amber-400/40"
                            : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{outlet.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACCESS SECTION (Module-wise Permissions) */}
              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-amber-500" />
                      <span>Access & Menu Permissions Section</span>
                    </h4>
                    <span className="text-[11px] text-zinc-500">
                      Configure granular view, edit, or no access per menu module
                    </span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSetAllPermissions("edit")}
                      className="rounded bg-emerald-50 px-2 py-1 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                    >
                      All Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllPermissions("view")}
                      className="rounded bg-sky-50 px-2 py-1 text-sky-700 border border-sky-200 hover:bg-sky-100 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300"
                    >
                      All View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllPermissions("none")}
                      className="rounded bg-zinc-100 px-2 py-1 text-zinc-600 border border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                    >
                      No Access
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto p-1 pr-2">
                  {SYSTEM_MODULES.map((mod) => {
                    const Icon = mod.icon;
                    const curLevel = permissions[mod.path] || "none";

                    return (
                      <div
                        key={mod.path}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-700 dark:text-amber-400">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {mod.label}
                          </span>
                        </div>

                        {/* Permission Pills */}
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPermissions((prev) => ({
                                ...prev,
                                [mod.path]: "none",
                              }))
                            }
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                              curLevel === "none"
                                ? "bg-rose-500 text-white font-bold"
                                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            }`}
                          >
                            None
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPermissions((prev) => ({
                                ...prev,
                                [mod.path]: "view",
                              }))
                            }
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                              curLevel === "view"
                                ? "bg-sky-500 text-white font-bold"
                                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            }`}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPermissions((prev) => ({
                                ...prev,
                                [mod.path]: "edit",
                              }))
                            }
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                              curLevel === "edit"
                                ? "bg-emerald-500 text-white font-bold"
                                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            }`}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-3 flex justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsModalOpen(false);
                  }}
                  className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-bold text-black shadow-xs hover:bg-amber-500"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {editingStaffId ? "Save Staff Changes" : "Save Staff Member"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Staff Member"
        message={`Are you sure you want to remove staff user "${deleteTarget?.name}"? They will no longer be able to log in to the portal.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
