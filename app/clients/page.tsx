"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Users,
  UserCheck,
  Search,
  Camera,
  MapPin,
  Phone,
  Mail,
  Layers,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Eye,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Upload,
  Globe,
} from "lucide-react";

interface MembershipPlan {
  id: string;
  name: string;
  amount: number;
}

interface GymOutlet {
  id: string;
  name: string;
  address: string;
}

interface ClientMember {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  planId: string;
  planName: string;
  outletId: string;
  outletName: string;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string;
  createdAt?: any;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientMember[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [outlets, setOutlets] = useState<GymOutlet[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields State
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedOutletId, setSelectedOutletId] = useState("");

  // GPS State
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingGps, setGettingGps] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // Camera & Photo State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Real-time Firestore Listeners (clients, plans, outlets)
  useEffect(() => {
    // Listen to Plans
    const plansUnsub = onSnapshot(collection(db, "plans"), (snapshot) => {
      const fetchedPlans = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as MembershipPlan[];
      setPlans(fetchedPlans);
      if (fetchedPlans.length > 0 && !selectedPlanId) {
        setSelectedPlanId(fetchedPlans[0].id);
      }
    });

    // Listen to Outlets
    const outletsUnsub = onSnapshot(collection(db, "outlets"), (snapshot) => {
      const fetchedOutlets = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as GymOutlet[];
      setOutlets(fetchedOutlets);
      if (fetchedOutlets.length > 0 && !selectedOutletId) {
        setSelectedOutletId(fetchedOutlets[0].id);
      }
    });

    // Listen to Clients
    const clientsRef = collection(db, "clients");
    const q = query(clientsRef, orderBy("createdAt", "desc"));
    const clientsUnsub = onSnapshot(
      q,
      (snapshot) => {
        const fetchedClients = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ClientMember[];
        setClients(fetchedClients);
        setLoading(false);
      },
      (error) => {
        console.error("Clients query fallback:", error);
        onSnapshot(clientsRef, (snapshot) => {
          const fetchedClients = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as ClientMember[];
          setClients(fetchedClients);
          setLoading(false);
        });
      }
    );

    return () => {
      plansUnsub();
      outletsUnsub();
      clientsUnsub();
      stopCamera();
    };
  }, []);

  // Ensure camera stream is attached when video DOM element mounts
  useEffect(() => {
    if (isCameraActive && streamRef.current) {
      const timer = setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current
            .play()
            .catch((e) => console.warn("Video element play error:", e));
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCameraActive]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingId(null);
    setName("");
    setMobile("");
    setEmail("");
    setAddress("");
    if (plans.length > 0) setSelectedPlanId(plans[0].id);
    if (outlets.length > 0) setSelectedOutletId(outlets[0].id);
    setLatitude(null);
    setLongitude(null);
    setGpsError("");
    setCapturedPhoto(null);
    setCameraError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: ClientMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(client.id);
    setName(client.name);
    setMobile(client.mobile);
    setEmail(client.email || "");
    setAddress(client.address);
    setSelectedPlanId(client.planId || (plans.length > 0 ? plans[0].id : ""));
    setSelectedOutletId(client.outletId || (outlets.length > 0 ? outlets[0].id : ""));
    setLatitude(client.latitude || null);
    setLongitude(client.longitude || null);
    setCapturedPhoto(client.photoUrl || null);
    setGpsError("");
    setCameraError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    stopCamera();
    setIsModalOpen(false);
    setEditingId(null);
  };

  // GPS Location Handler
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setGettingGps(true);
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGettingGps(false);
      },
      (error) => {
        console.warn("GPS Location error:", error);
        setGpsError("Failed to fetch GPS coordinates. Please allow location access.");
        setGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Camera Management
  const startCamera = async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported in this browser");
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

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

  // Save or Update Client
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !address.trim()) {
      alert("Please fill in all required fields (Name, Mobile, Address)");
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUrl = capturedPhoto || "";

      // Upload new captured photo to ImageKit if it's base64 data URL
      if (capturedPhoto && capturedPhoto.startsWith("data:image")) {
        const formData = new FormData();
        formData.append("file", capturedPhoto);
        formData.append("fileName", `client_${name.replace(/\s+/g, "_")}_${Date.now()}.jpg`);

        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalPhotoUrl = uploadData.url || finalPhotoUrl;
        }
      }

      const matchedPlan = plans.find((p) => p.id === selectedPlanId);
      const matchedOutlet = outlets.find((o) => o.id === selectedOutletId);

      const clientData = {
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim() || null,
        address: address.trim(),
        planId: selectedPlanId,
        planName: matchedPlan?.name || "General Membership",
        outletId: selectedOutletId,
        outletName: matchedOutlet?.name || "Main Branch",
        latitude: latitude || null,
        longitude: longitude || null,
        photoUrl: finalPhotoUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        // Update Existing Client
        await updateDoc(doc(db, "clients", editingId), clientData);
      } else {
        // Add New Client
        await addDoc(collection(db, "clients"), {
          ...clientData,
          createdAt: serverTimestamp(),
        });
      }

      handleCloseModal();
    } catch (err: any) {
      console.error("Error saving client:", err);
      alert("Failed to save client registration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (id: string, clientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete member "${clientName}"?`)) {
      try {
        await deleteDoc(doc(db, "clients", id));
      } catch (err) {
        console.error("Error deleting client:", err);
        alert("Failed to delete client record.");
      }
    }
  };

  const handleRowClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.outletName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer
      title="Clients"
      subtitle="View, manage, and register gym members and memberships"
      actionText="Add Client"
      onActionClick={handleOpenAddModal}
    >
      {/* Top Stat Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Members
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {clients.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Registered
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Active Plans
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {plans.length}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Available Tiers
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Gym Outlets
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {outlets.length}
            </span>
            <span className="text-xs font-medium text-zinc-400">Branches</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 px-5 py-3 gap-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Gym Clients List
            </span>
            <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-400/30">
              {clients.length} Total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search name, phone, outlet..."
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
              Loading clients from Firebase...
            </span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-400/30">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {searchQuery ? "No matching clients found" : "No Clients Registered Yet"}
            </h3>
            <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              Click the Add Client button to register members with photo, GPS location, and plan assignment.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Client Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Client</th>
                  <th className="px-5 py-3 font-semibold">Mobile & Email</th>
                  <th className="px-5 py-3 font-semibold">Assigned Plan</th>
                  <th className="px-5 py-3 font-semibold">Gym Outlet</th>
                  <th className="px-5 py-3 font-semibold">GPS Coordinates</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => handleRowClick(client.id)}
                    className="cursor-pointer hover:bg-amber-400/5 dark:hover:bg-amber-400/10 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden border border-amber-400 bg-amber-400/20 text-amber-700 font-semibold text-xs shadow-xs">
                          {client.photoUrl ? (
                            <img
                              src={client.photoUrl}
                              alt={client.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            client.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-amber-600 transition-colors">
                            {client.name}
                          </span>
                          <span className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                            {client.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-zinc-400" />
                          {client.mobile}
                        </span>
                        {client.email && (
                          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-zinc-400" />
                            {client.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-400/30">
                        <Layers className="h-3 w-3" />
                        {client.planName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        <Building2 className="h-3 w-3 text-zinc-500" />
                        {client.outletName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {client.latitude && client.longitude ? (
                        <div className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
                          <Globe className="h-3 w-3" />
                          <span>
                            {client.latitude.toFixed(4)}, {client.longitude.toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">Not Captured</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRowClick(client.id)}
                          className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-amber-400 hover:text-black dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
                          title="View Client Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleOpenEditModal(client, e)}
                          className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
                          title="Edit Client"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClient(client.id, client.name, e)}
                          className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400 transition-colors"
                          title="Delete Client"
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

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-amber-400 text-black">
                  <Users className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingId ? "Edit Client Member" : "Add New Client Member"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveClient} className="mt-4 flex flex-col gap-4">
              {/* Photo Capture & Preview Section */}
              <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 rounded-xl p-4 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Client Photo (Live Capture or Upload)
                </span>

                {/* Captured Photo Preview */}
                {capturedPhoto ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                      <img
                        src={capturedPhoto}
                        alt="Captured Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCapturedPhoto(null)}
                      className="cursor-pointer text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Retake / Change Photo</span>
                    </button>
                  </div>
                ) : isCameraActive ? (
                  /* Live Camera Preview */
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="relative h-48 w-full max-w-xs rounded-xl overflow-hidden bg-black border border-amber-400 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-black shadow-sm hover:bg-amber-500"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                      >
                        Cancel Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Buttons to trigger Camera or File Upload */
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black shadow-xs hover:bg-amber-500 transition-colors"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Capture Live Photo</span>
                    </button>

                    <label className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                      <Upload className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                {cameraError && (
                  <span className="text-[11px] font-semibold text-red-500 mt-2">
                    {cameraError}
                  </span>
                )}
              </div>

              {/* Name & Mobile (2 cols) */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Email (Optional) & Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Client residential address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400 resize-none"
                />
              </div>

              {/* Plan Selection & Outlet Selection (2 cols) */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Membership Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="cursor-pointer h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  >
                    {plans.length === 0 ? (
                      <option value="">No plans configured yet</option>
                    ) : (
                      plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.amount})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Gym Outlet <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedOutletId}
                    onChange={(e) => setSelectedOutletId(e.target.value)}
                    className="cursor-pointer h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  >
                    {outlets.length === 0 ? (
                      <option value="">No outlets configured yet</option>
                    ) : (
                      outlets.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* GPS Geolocation Section */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      GPS Location Coordinates
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={gettingGps}
                    className="cursor-pointer flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-amber-400 hover:bg-black disabled:opacity-50 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    {gettingGps ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-3 w-3" />
                        <span>Get GPS Location</span>
                      </>
                    )}
                  </button>
                </div>

                {latitude && longitude ? (
                  <div className="mt-2 flex items-center gap-2 rounded-md bg-emerald-100/70 p-2 text-xs font-semibold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>
                      Latitude: {latitude.toFixed(6)}, Longitude: {longitude.toFixed(6)}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Click "Get GPS Location" to capture client's latitude & longitude.
                  </span>
                )}
                {gpsError && (
                  <span className="text-[11px] text-red-500 font-medium mt-1 block">
                    {gpsError}
                  </span>
                )}
              </div>

              {/* Modal Actions */}
              <div className="mt-2 flex items-center justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                      <span>Uploading & Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{editingId ? "Update Client" : "Save Client"}</span>
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
