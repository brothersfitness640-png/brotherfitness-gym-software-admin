"use client";

import { useState, useEffect, useRef } from "react";
import PageContainer from "@/components/PageContainer";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
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
  UserCheck,
  Plus,
  Search,
  Upload,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  MapPin,
  Camera,
  IndianRupee,
  Calendar,
  Eye,
  Building2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface EmployeeMember {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  outletId: string;
  outletName: string;
  monthlySalary: number;
  acceptableLeaves: number;
  latitude: number | null;
  longitude: number | null;
  photoUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface OutletItem {
  id: string;
  name: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const { canEdit } = useAuth();
  const editable = canEdit("/employees");

  const [employeeList, setEmployeeList] = useState<EmployeeMember[]>([]);
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOutletFilter, setActiveOutletFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 45;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeOutletFilter]);

  // Employee Modal State
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("25000");
  const [acceptableLeaves, setAcceptableLeaves] = useState("2");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState("");

  // Live Camera & Photo Upload State
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
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

  // 2. Fetch Employees (staff collection) Real-Time
  useEffect(() => {
    const staffRef = collection(db, "staff");
    const q = query(staffRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as EmployeeMember[];
        setEmployeeList(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Employees query fallback:", err);
        onSnapshot(staffRef, (snapshot) => {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as EmployeeMember[];
          setEmployeeList(list);
          setLoading(false);
        });
      }
    );
    return () => unsub();
  }, []);

  // Camera Helper Functions
  const startCamera = async (mode: "user" | "environment" = cameraFacingMode) => {
    setCameraError("");
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: mode },
        audio: false,
      });
      streamRef.current = mediaStream;
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or camera not available");
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
      streamRef.current.getTracks().forEach((track) => track.stop());
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

  // GPS Capture Helper
  const handleCaptureGpsLocation = () => {
    setIsCapturingGps(true);
    setGpsStatusMsg("Fetching live GPS coordinates...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setIsCapturingGps(false);
          setGpsStatusMsg(
            `GPS Captured: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
          );
        },
        (error) => {
          console.error("GPS Location Error:", error);
          setIsCapturingGps(false);
          setGpsStatusMsg("Failed to capture GPS location. Please allow location permissions.");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setIsCapturingGps(false);
      setGpsStatusMsg("Geolocation is not supported by your browser.");
    }
  };

  // Open Add / Edit Employee Modal
  const handleOpenAddEmployeeModal = () => {
    if (!editable) return;
    setEditingEmployeeId(null);
    setName("");
    setMobile("");
    setEmail("");
    setAddress("");
    setSelectedOutletId(outlets.length > 0 ? outlets[0].id : "");
    setMonthlySalary("25000");
    setAcceptableLeaves("2");
    setLatitude(null);
    setLongitude(null);
    setGpsStatusMsg("");
    setCapturedPhoto(null);
    stopCamera();
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployeeModal = (emp: EmployeeMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    setEditingEmployeeId(emp.id);
    setName(emp.name);
    setMobile(emp.mobile);
    setEmail(emp.email || "");
    setAddress(emp.address);
    setSelectedOutletId(emp.outletId || "");
    setMonthlySalary(emp.monthlySalary.toString());
    setAcceptableLeaves((emp.acceptableLeaves || 2).toString());
    setLatitude(emp.latitude || null);
    setLongitude(emp.longitude || null);
    if (emp.latitude && emp.longitude) {
      setGpsStatusMsg(`Saved GPS: ${emp.latitude.toFixed(5)}, ${emp.longitude.toFixed(5)}`);
    } else {
      setGpsStatusMsg("");
    }
    setCapturedPhoto(emp.photoUrl || null);
    stopCamera();
    setIsEmployeeModalOpen(true);
  };

  // Save Employee
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !address.trim()) {
      alert("Please fill in required fields (Name, Mobile, Address)");
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUrl = capturedPhoto || "";

      // Upload live captured photo to ImageKit if it's a base64 data URL
      if (capturedPhoto && capturedPhoto.startsWith("data:image")) {
        const formData = new FormData();
        formData.append("file", capturedPhoto);
        formData.append(
          "fileName",
          `employee_${name.replace(/\s+/g, "_")}_${Date.now()}.jpg`
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

      const matchedOutlet = outlets.find((o) => o.id === selectedOutletId);
      const outletName = matchedOutlet ? matchedOutlet.name : "Main Branch";

      const employeeData = {
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim() || null,
        address: address.trim(),
        outletId: selectedOutletId || "",
        outletName: outletName,
        monthlySalary: parseFloat(monthlySalary) || 0,
        acceptableLeaves: parseInt(acceptableLeaves) || 2,
        latitude: latitude || null,
        longitude: longitude || null,
        photoUrl: finalPhotoUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingEmployeeId) {
        await updateDoc(doc(db, "staff", editingEmployeeId), employeeData);
      } else {
        await addDoc(collection(db, "staff"), {
          ...employeeData,
          createdAt: serverTimestamp(),
        });
      }

      stopCamera();
      setIsEmployeeModalOpen(false);
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("Failed to save employee.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Employee Handler
  const handleDeleteEmployeeClick = (emp: EmployeeMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    setDeleteTarget({
      id: emp.id,
      name: emp.name,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "staff", deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert("Failed to delete employee.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Employee List
  const filteredEmployeeList = employeeList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobile.includes(searchQuery) ||
      (s.outletName && s.outletName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (activeOutletFilter !== "all" && s.outletId !== activeOutletFilter) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredEmployeeList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployeeList = filteredEmployeeList.slice(startIndex, startIndex + itemsPerPage);

  const totalPayrollBudget = employeeList.reduce(
    (sum, s) => sum + (s.monthlySalary || 0),
    0
  );

  return (
    <PageContainer
      title="Employees & Trainers Directory"
      subtitle="Manage gym employees, trainers, attendance security, advances, and monthly salary payouts"
      actionText={editable ? "+ Add Employee" : undefined}
      onActionClick={editable ? handleOpenAddEmployeeModal : undefined}
    >
      {!editable && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span><strong>View-Only Mode:</strong> Your staff account has view permissions for Employees. Adding, editing, or deleting employee records is restricted.</span>
        </div>
      )}

      {/* Top Stat Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Employees & Trainers
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {employeeList.length}
            </span>
            <span className="text-xs font-semibold text-zinc-400">Staff Members</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Active Outlets
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
              Branches
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Monthly Payroll Budget
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              ₹{totalPayrollBudget.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Per Month
            </span>
          </div>
        </div>
      </div>

      {/* Main Table / Grid Container */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Toolbar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 px-5 py-3.5 gap-3 dark:border-zinc-800">
          {/* Dynamic Outlet Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveOutletFilter("all")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeOutletFilter === "all"
                  ? "bg-amber-400 text-black shadow-xs font-semibold"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              All Outlets ({employeeList.length})
            </button>

            {outlets.map((o) => {
              const count = employeeList.filter((s) => s.outletId === o.id).length;
              return (
                <button
                  key={o.id}
                  onClick={() => setActiveOutletFilter(o.id)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeOutletFilter === o.id
                      ? "bg-amber-400 text-black shadow-xs font-semibold"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {o.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search & Actions Bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search employee by name or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-52 rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
              />
            </div>

            {editable && (
              <button
                onClick={handleOpenAddEmployeeModal}
                className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 text-xs font-semibold text-black hover:bg-amber-500 shadow-md transition-transform active:scale-98"
              >
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
            <span className="text-xs font-semibold text-zinc-500">
              Loading employees directory...
            </span>
          </div>
        ) : filteredEmployeeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-400/30">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No Employees Found
            </h3>
            <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              Add trainers, front desk staff, or gym instructors to start tracking attendance and payroll.
            </p>
            {editable && (
              <button
                onClick={handleOpenAddEmployeeModal}
                className="cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-500 transition-colors"
              >
                + Add Employee Now
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {paginatedEmployeeList.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => router.push(`/employees/${emp.id}`)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    {/* Photo & GPS Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="relative h-14 w-14 rounded-full overflow-hidden bg-amber-400/10 border-2 border-amber-400 shrink-0">
                        {emp.photoUrl ? (
                          <img
                            src={emp.photoUrl}
                            alt={emp.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-amber-700 font-bold text-lg">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-400/30">
                        {emp.outletName || "Main Branch"}
                      </span>
                    </div>

                    {/* Employee Info */}
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                      {emp.name}
                    </h4>

                    <div className="mt-2 flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{emp.mobile}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="h-3.5 w-3.5 text-amber-500" />
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          ₹{emp.monthlySalary.toLocaleString("en-IN")}/mo
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{emp.acceptableLeaves || 2} Allowed Leaves/mo</span>
                      </div>

                      {emp.latitude && emp.longitude && (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          <span>GPS Registered</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Details →</span>
                    </span>

                    {editable && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleOpenEditEmployeeModal(emp, e)}
                          className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                          title="Edit Employee"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteEmployeeClick(emp, e)}
                          className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400"
                          title="Delete Employee"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Showing <strong className="text-zinc-900 dark:text-zinc-100">{startIndex + 1}</strong> to{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">{Math.min(startIndex + itemsPerPage, filteredEmployeeList.length)}</strong> of{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">{filteredEmployeeList.length}</strong> employees
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

      {/* --- ADD / EDIT EMPLOYEE MODAL --- */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingEmployeeId ? "Edit Employee" : "Add New Employee"}
                </h3>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setIsEmployeeModalOpen(false);
                }}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="mt-4 flex flex-col gap-4">
              {/* Photo Live Camera / File Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Employee Photo (ImageKit CDN Upload)
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40 rounded-xl p-4 text-center">
                  {isCameraActive ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-amber-400 shadow-md bg-black">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-amber-500 shadow-xs"
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
                          <span>{cameraFacingMode === "user" ? "Back Camera" : "Front Camera"}</span>
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
                      <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400 shadow-md">
                        <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
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
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera(cameraFacingMode)}
                          className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-amber-500 shadow-xs"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Take Camera Photo</span>
                        </button>
                        <label className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload File</span>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                      <span className="text-[10px] text-zinc-400">Photo will be saved to ImageKit CDN</span>
                    </div>
                  )}
                  {cameraError && <p className="text-xs text-red-500 mt-2 font-medium">{cameraError}</p>}
                </div>
              </div>

              {/* Employee Name & Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
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
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Email & Outlet Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@brothersfitness.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Assigned Outlet Branch
                  </label>
                  <select
                    value={selectedOutletId}
                    onChange={(e) => setSelectedOutletId(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                  >
                    <option value="">Select Branch...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Residential Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. H.No 12, Road #4, Jubilee Hills, Hyderabad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                />
              </div>

              {/* Monthly Salary & Acceptable Leaves */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Monthly Base Salary (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 30000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Acceptable Leaves / Month
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 2"
                    value={acceptableLeaves}
                    onChange={(e) => setAcceptableLeaves(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Live GPS Capture Box */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Attendance Security Location Coordinates
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCaptureGpsLocation}
                    disabled={isCapturingGps}
                    className="cursor-pointer flex items-center gap-1 rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-black hover:bg-amber-500"
                  >
                    {isCapturingGps ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    <span>Get GPS Location</span>
                  </button>
                </div>
                {gpsStatusMsg && (
                  <p className="mt-2 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                    {gpsStatusMsg}
                  </p>
                )}
              </div>

              <div className="mt-3 flex justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsEmployeeModalOpen(false);
                  }}
                  className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-semibold text-black shadow-xs hover:bg-amber-500"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>{editingEmployeeId ? "Save Changes" : "Save Employee"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Employee"
        message={`Are you sure you want to delete employee "${deleteTarget?.name}"?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
