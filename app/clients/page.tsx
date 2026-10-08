"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CreditCard,
  IndianRupee,
  Filter,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface MembershipPlan {
  id: string;
  name: string;
  amount: number;
  duration?: string;
  outletId?: string;
  outletName?: string;
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
  planStartDate?: string;
  planEndDate?: string;
  outletId: string;
  outletName: string;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string;
  createdAt?: any;
}

interface AssignedPlanDoc {
  id: string;
  clientId: string;
  planName: string;
  startDate: string;
  endDate?: string;
  totalAmount?: number;
  durationMonths?: number;
}

function computeEndDate(startDateStr: string, months: number): string {
  try {
    const d = new Date(startDateStr);
    if (isNaN(d.getTime())) return startDateStr;
    d.setMonth(d.getMonth() + (months || 1));
    return d.toISOString().split("T")[0];
  } catch {
    return startDateStr;
  }
}

function getClientPlanStatus(client: ClientMember, assignedPlans: AssignedPlanDoc[]) {
  const todayStr = new Date().toISOString().split("T")[0];

  if (!assignedPlans || assignedPlans.length === 0) {
    if (client.planEndDate) {
      const isExpired = client.planEndDate < todayStr;
      return {
        status: isExpired ? ("Expired" as const) : ("Ongoing" as const),
        endDate: client.planEndDate,
        planName: client.planName || "Membership",
      };
    }
    // If client has a planName assigned (e.g. from registration or legacy)
    if (client.planName && client.planName.trim() !== "" && client.planName !== "No Plan") {
      if (client.planStartDate) {
        const computedEnd = computeEndDate(client.planStartDate, 1);
        const isExpired = computedEnd < todayStr;
        return {
          status: isExpired ? ("Expired" as const) : ("Ongoing" as const),
          endDate: computedEnd,
          planName: client.planName,
        };
      }
      return {
        status: "Ongoing" as const,
        endDate: null,
        planName: client.planName,
      };
    }
    return {
      status: "No Plan" as const,
      endDate: null,
      planName: "No Plan",
    };
  }

  // Find any ongoing plan (endDate >= todayStr)
  const ongoingPlan = assignedPlans.find((p) => {
    const end = p.endDate || computeEndDate(p.startDate, p.durationMonths || 1);
    return end >= todayStr;
  });

  if (ongoingPlan) {
    const end = ongoingPlan.endDate || computeEndDate(ongoingPlan.startDate, ongoingPlan.durationMonths || 1);
    return {
      status: "Ongoing" as const,
      endDate: end,
      planName: ongoingPlan.planName,
    };
  }

  // All plans are expired - pick the latest one
  const sortedPlans = [...assignedPlans].sort((a, b) => {
    const endA = a.endDate || computeEndDate(a.startDate, a.durationMonths || 1);
    const endB = b.endDate || computeEndDate(b.startDate, b.durationMonths || 1);
    return endB.localeCompare(endA);
  });
  const latestPlan = sortedPlans[0];
  const end = latestPlan.endDate || computeEndDate(latestPlan.startDate, latestPlan.durationMonths || 1);

  return {
    status: "Expired" as const,
    endDate: end,
    planName: latestPlan.planName,
  };
}

export default function ClientsPage() {
  const router = useRouter();
  const { canEdit } = useAuth();
  const editable = canEdit("/clients");

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

  // Plan & Payment State for Client Registration
  const [planAmount, setPlanAmount] = useState("");
  const [planDiscount, setPlanDiscount] = useState("0");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [splitCash, setSplitCash] = useState("");
  const [splitUpi, setSplitUpi] = useState("");
  const [splitCard, setSplitCard] = useState("");

  const handlePaymentMethodChange = (mode: string) => {
    setPaymentMethod(mode);
    if (mode === "Split") {
      const rec = parseFloat(receivedAmount) || 0;
      if (!splitCash && !splitUpi && !splitCard && rec > 0) {
        setSplitCash(rec.toString());
        setSplitUpi("0");
        setSplitCard("0");
      }
    }
  };

  const [planStartDate, setPlanStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [planDurationMonths, setPlanDurationMonths] = useState("1");
  const [planEndDate, setPlanEndDate] = useState(
    computeEndDate(new Date().toISOString().split("T")[0], 1)
  );

  // Client Plans Map for live Ongoing vs Expired status detection
  const [clientPlansMap, setClientPlansMap] = useState<Record<string, AssignedPlanDoc[]>>({});

  // Filters for Clients List
  const [planStatusFilter, setPlanStatusFilter] = useState<"all" | "ongoing" | "expired" | "no_plan">("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [outletFilter, setOutletFilter] = useState("all");

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 45;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, planStatusFilter, planTypeFilter, outletFilter]);

  // Real-time Firestore Listeners (clients, plans, outlets, assigned_plans)
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

    // Listen to all Assigned Plans across all clients
    let assignedPlansUnsub = () => {};
    try {
      const plansQuery = collectionGroup(db, "assigned_plans");
      assignedPlansUnsub = onSnapshot(
        plansQuery,
        (snapshot) => {
          const map: Record<string, AssignedPlanDoc[]> = {};
          snapshot.docs.forEach((docSnap) => {
            const parentClientId = docSnap.ref.parent.parent?.id;
            if (parentClientId) {
              if (!map[parentClientId]) map[parentClientId] = [];
              map[parentClientId].push({
                id: docSnap.id,
                clientId: parentClientId,
                ...(docSnap.data() as any),
              });
            }
          });
          setClientPlansMap(map);
        },
        (err) => {
          console.warn("assigned_plans collectionGroup listener fallback:", err);
        }
      );
    } catch (err) {
      console.warn("assigned_plans collectionGroup setup error:", err);
    }

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
      assignedPlansUnsub();
      clientsUnsub();
      stopCamera();
    };
  }, []);

  // Plan field change handlers for Add Client modal
  const handlePlanSelect = (newPlanId: string) => {
    setSelectedPlanId(newPlanId);
    const found = plans.find((p) => p.id === newPlanId);
    if (found) {
      const amt = (found.amount || 0).toString();
      setPlanAmount(amt);
      setPlanDiscount("0");
      setReceivedAmount(amt);
      let months = 1;
      if (found.duration) {
        const match = found.duration.match(/\d+/);
        if (match) {
          months = parseInt(match[0]) || 1;
          if (found.duration.toLowerCase().includes("year")) months = months * 12;
        }
      } else if (found.name) {
        const match = found.name.match(/\d+/);
        if (match) {
          months = parseInt(match[0]) || 1;
          if (found.name.toLowerCase().includes("year")) months = months * 12;
        }
      }
      setPlanDurationMonths(months.toString());
      setPlanEndDate(computeEndDate(planStartDate, months));
    }
  };

  const handlePlanAmountChange = (val: string) => {
    setPlanAmount(val);
    const base = parseFloat(val) || 0;
    const disc = parseFloat(planDiscount) || 0;
    const finalTot = Math.max(0, base - disc);
    setReceivedAmount(finalTot.toString());
  };

  const handlePlanDiscountChange = (val: string) => {
    setPlanDiscount(val);
    const base = parseFloat(planAmount) || 0;
    const disc = parseFloat(val) || 0;
    const finalTot = Math.max(0, base - disc);
    setReceivedAmount(finalTot.toString());
  };

  const handlePlanStartDateChange = (val: string) => {
    setPlanStartDate(val);
    const months = parseInt(planDurationMonths) || 1;
    setPlanEndDate(computeEndDate(val, months));
  };

  const handlePlanDurationChange = (monthsStr: string) => {
    setPlanDurationMonths(monthsStr);
    const months = parseInt(monthsStr) || 1;
    setPlanEndDate(computeEndDate(planStartDate, months));
  };

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
  const handleOutletChange = (newOutletId: string) => {
    setSelectedOutletId(newOutletId);
    const validPlans = plans.filter(
      (p) => !p.outletId || p.outletId === "all" || p.outletId === newOutletId
    );
    if (validPlans.length > 0 && !validPlans.some((p) => p.id === selectedPlanId)) {
      handlePlanSelect(validPlans[0].id);
    }
  };

  const handleOpenAddModal = () => {
    if (!editable) return;
    setEditingId(null);
    setName("");
    setMobile("");
    setEmail("");
    setAddress("");
    const initialOutletId = outlets.length > 0 ? outlets[0].id : "";
    setSelectedOutletId(initialOutletId);
    const validPlans = plans.filter(
      (p) => !p.outletId || p.outletId === "all" || p.outletId === initialOutletId
    );
    const chosenPlan = validPlans.length > 0 ? validPlans[0] : (plans.length > 0 ? plans[0] : null);
    const chosenPlanId = chosenPlan ? chosenPlan.id : "";
    setSelectedPlanId(chosenPlanId);

    const today = new Date().toISOString().split("T")[0];
    setPlanStartDate(today);

    if (chosenPlan) {
      const amt = (chosenPlan.amount || 0).toString();
      setPlanAmount(amt);
      setPlanDiscount("0");
      setReceivedAmount(amt);
      let months = 1;
      if (chosenPlan.duration) {
        const match = chosenPlan.duration.match(/\d+/);
        if (match) {
          months = parseInt(match[0]) || 1;
          if (chosenPlan.duration.toLowerCase().includes("year")) months = months * 12;
        }
      } else if (chosenPlan.name) {
        const match = chosenPlan.name.match(/\d+/);
        if (match) {
          months = parseInt(match[0]) || 1;
          if (chosenPlan.name.toLowerCase().includes("year")) months = months * 12;
        }
      }
      setPlanDurationMonths(months.toString());
      setPlanEndDate(computeEndDate(today, months));
    } else {
      setPlanAmount("0");
      setPlanDiscount("0");
      setReceivedAmount("0");
      setPlanDurationMonths("1");
      setPlanEndDate(computeEndDate(today, 1));
    }
    setPaymentMethod("Cash");
    setSplitCash("");
    setSplitUpi("");
    setSplitCard("");

    setLatitude(null);
    setLongitude(null);
    setGpsError("");
    setCapturedPhoto(null);
    setCameraError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: ClientMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
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
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");

  const startCamera = async (mode: "user" | "environment" = cameraFacingMode) => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported in this browser");
        return;
      }
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
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedMobile || !trimmedAddress) {
      alert("Please fill in all required fields (Name, Mobile, Address)");
      return;
    }

    // 1. DUPLICATE MOBILE CHECK: Verify if mobile number already exists in database
    const existingClient = clients.find(
      (c) => c.mobile.trim() === trimmedMobile && c.id !== editingId
    );
    if (existingClient) {
      alert(
        `A client with mobile number "${trimmedMobile}" is already registered (${existingClient.name})!\n\nPlease enter a unique mobile number.`
      );
      return;
    }

    // 2. SPLIT PAYMENT VALIDATION
    const recAmt = parseFloat(receivedAmount) || 0;
    if (!editingId && paymentMethod === "Split" && recAmt > 0) {
      const c = parseFloat(splitCash) || 0;
      const u = parseFloat(splitUpi) || 0;
      const cd = parseFloat(splitCard) || 0;
      const totalSplit = c + u + cd;
      if (Math.abs(totalSplit - recAmt) > 0.01) {
        alert(
          `Split payment breakdown total (₹${totalSplit}) does not match Received Amount (₹${recAmt}).\nPlease adjust the Cash, UPI, or Card split amounts.`
        );
        return;
      }
    }

    setSaving(true);
    try {
      let finalPhotoUrl = capturedPhoto || "";

      // Upload new captured photo to ImageKit if it's base64 data URL
      if (capturedPhoto && capturedPhoto.startsWith("data:image")) {
        const formData = new FormData();
        formData.append("file", capturedPhoto);
        formData.append("fileName", `client_${trimmedName.replace(/\s+/g, "_")}_${Date.now()}.jpg`);

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

      const computedEnd = planEndDate || computeEndDate(planStartDate, parseInt(planDurationMonths) || 1);

      const clientData = {
        name: trimmedName,
        mobile: trimmedMobile,
        email: email.trim() || null,
        address: trimmedAddress,
        planId: selectedPlanId,
        planName: matchedPlan?.name || "General Membership",
        planStartDate: planStartDate,
        planEndDate: computedEnd,
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
        // Add New Client Doc
        const newClientDocRef = await addDoc(collection(db, "clients"), {
          ...clientData,
          createdAt: serverTimestamp(),
        });
        const newClientId = newClientDocRef.id;

        // Save Assigned Plan in subcollection `clients/{newClientId}/assigned_plans`
        const baseAmt = parseFloat(planAmount) || (matchedPlan?.amount || 0);
        const discAmt = parseFloat(planDiscount) || 0;
        const finalTot = Math.max(0, baseAmt - discAmt);
        const durMonths = parseInt(planDurationMonths) || 1;

        const assignedPlanRef = await addDoc(
          collection(db, "clients", newClientId, "assigned_plans"),
          {
            planName: matchedPlan?.name || "General Membership",
            basePrice: baseAmt,
            discount: discAmt,
            totalAmount: finalTot,
            durationMonths: durMonths,
            startDate: planStartDate,
            endDate: computedEnd,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );

        // Save Initial Payment in subcollection `clients/{newClientId}/installments` if receivedAmount > 0
        if (recAmt > 0) {
          const cashVal = parseFloat(splitCash) || 0;
          const upiVal = parseFloat(splitUpi) || 0;
          const cardVal = parseFloat(splitCard) || 0;

          await addDoc(
            collection(db, "clients", newClientId, "installments"),
            {
              assignedPlanId: assignedPlanRef.id,
              amount: recAmt,
              date: planStartDate,
              mode: paymentMethod || "Cash",
              splitCash: paymentMethod === "Split" ? cashVal : 0,
              splitUpi: paymentMethod === "Split" ? upiVal : 0,
              splitCard: paymentMethod === "Split" ? cardVal : 0,
              status: "Paid",
              note:
                paymentMethod === "Split"
                  ? `Initial registration payment (Split: Cash ₹${cashVal}, UPI ₹${upiVal}, Card ₹${cardVal})`
                  : `Initial registration payment via ${paymentMethod}`,
              createdAt: serverTimestamp(),
            }
          );
        }
      }

      handleCloseModal();
    } catch (err: any) {
      console.error("Error saving client:", err);
      alert("Failed to save client registration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Custom Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenDeleteModal = (id: string, clientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    setDeleteTarget({ id, name: clientName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "clients", deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting client:", err);
      alert("Failed to delete client record.");
    } finally {
      setDeleting(false);
    }
  };

  const handleRowClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const availablePlans = plans.filter(
    (p) => !p.outletId || p.outletId === "all" || p.outletId === selectedOutletId
  );

  const filteredClients = clients.filter((client) => {
    const matchSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.mobile.includes(searchQuery) ||
      client.outletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.planName && client.planName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.address && client.address.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    // Outlet Filter
    if (outletFilter !== "all" && client.outletId !== outletFilter) {
      return false;
    }

    const planInfo = getClientPlanStatus(client, clientPlansMap[client.id] || []);

    // Plan Status Filter
    if (planStatusFilter === "ongoing" && planInfo.status !== "Ongoing") return false;
    if (planStatusFilter === "expired" && planInfo.status !== "Expired") return false;
    if (planStatusFilter === "no_plan" && planInfo.status !== "No Plan") return false;

    // Plan Type Filter
    if (planTypeFilter !== "all") {
      const matchId = client.planId === planTypeFilter;
      const matchName = planInfo.planName.toLowerCase() === planTypeFilter.toLowerCase();
      if (!matchId && !matchName) return false;
    }

    return true;
  });

  const ongoingCount = clients.filter(
    (c) => getClientPlanStatus(c, clientPlansMap[c.id] || []).status === "Ongoing"
  ).length;

  const expiredCount = clients.filter(
    (c) => getClientPlanStatus(c, clientPlansMap[c.id] || []).status === "Expired"
  ).length;

  const noPlanCount = clients.filter(
    (c) => getClientPlanStatus(c, clientPlansMap[c.id] || []).status === "No Plan"
  ).length;

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <PageContainer
      title="Clients"
      subtitle="View, manage, and register gym members and memberships"
      actionText={editable ? "Add Client" : undefined}
      onActionClick={editable ? handleOpenAddModal : undefined}
    >
      {!editable && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span><strong>View-Only Mode:</strong> Your staff account has view permissions for Clients. Adding, editing, or deleting client records is restricted.</span>
        </div>
      )}

      {/* Top Stat Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => setPlanStatusFilter("all")}
          className={`cursor-pointer flex flex-col justify-between rounded-xl border p-4.5 shadow-xs transition-all ${
            planStatusFilter === "all"
              ? "border-amber-400 bg-amber-400/5 ring-2 ring-amber-400/30 dark:bg-amber-400/10"
              : "border-zinc-200 bg-white hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-900"
          }`}
        >
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
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Registered
            </span>
          </div>
        </div>

        <div
          onClick={() => setPlanStatusFilter("ongoing")}
          className={`cursor-pointer flex flex-col justify-between rounded-xl border p-4.5 shadow-xs transition-all ${
            planStatusFilter === "ongoing"
              ? "border-emerald-500 bg-emerald-100/60 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40"
              : "border-emerald-200 bg-emerald-50/40 hover:border-emerald-400 dark:border-emerald-900/40 dark:bg-emerald-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Ongoing Plans
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {ongoingCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Active Members
            </span>
          </div>
        </div>

        <div
          onClick={() => setPlanStatusFilter("expired")}
          className={`cursor-pointer flex flex-col justify-between rounded-xl border p-4.5 shadow-xs transition-all ${
            planStatusFilter === "expired"
              ? "border-red-500 bg-red-100/60 ring-2 ring-red-500/30 dark:bg-red-950/40"
              : "border-red-200 bg-red-50/40 hover:border-red-400 dark:border-red-900/40 dark:bg-red-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-800 dark:text-red-300">
              Expired Plans
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-700 dark:text-red-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-700 dark:text-red-400">
              {expiredCount}
            </span>
            <span className="text-xs font-semibold text-red-600">
              Plan Expired
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
        {/* Search & Filter Toolbar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search member by name, phone, plan, outlet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-8 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Unified Filter Dropdowns Group */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={planStatusFilter}
                onChange={(e) => setPlanStatusFilter(e.target.value as any)}
                className="cursor-pointer h-9 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-800 outline-none hover:bg-zinc-100 focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <option value="all">All Status ({clients.length})</option>
                <option value="ongoing">🟢 Ongoing ({ongoingCount})</option>
                <option value="expired">🔴 Expired ({expiredCount})</option>
                <option value="no_plan">⚪ No Plan ({noPlanCount})</option>
              </select>
            </div>

            {/* Plan Type Filter */}
            <div className="relative">
              <select
                value={planTypeFilter}
                onChange={(e) => setPlanTypeFilter(e.target.value)}
                className="cursor-pointer h-9 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-800 outline-none hover:bg-zinc-100 focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 transition-colors max-w-[170px] truncate"
              >
                <option value="all">All Plans ({plans.length})</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Outlet Filter */}
            <div className="relative">
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="cursor-pointer h-9 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-800 outline-none hover:bg-zinc-100 focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 transition-colors max-w-[160px] truncate"
              >
                <option value="all">All Outlets</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear All Filters Button */}
            {(searchQuery ||
              planStatusFilter !== "all" ||
              planTypeFilter !== "all" ||
              outletFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPlanStatusFilter("all");
                  setPlanTypeFilter("all");
                  setOutletFilter("all");
                }}
                className="cursor-pointer flex h-9 shrink-0 items-center gap-1 rounded-lg border border-dashed border-red-300 bg-red-50/70 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 transition-colors"
                title="Reset all filters"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
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
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {searchQuery ||
              planStatusFilter !== "all" ||
              planTypeFilter !== "all" ||
              outletFilter !== "all"
                ? "No matching clients found"
                : "No Clients Registered Yet"}
            </h3>
            <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              {searchQuery ||
              planStatusFilter !== "all" ||
              planTypeFilter !== "all" ||
              outletFilter !== "all"
                ? "Try adjusting your search query or reset the filters to see more members."
                : "Click the Add Client button to register members with photo, GPS location, and plan assignment."}
            </p>
            {searchQuery ||
            planStatusFilter !== "all" ||
            planTypeFilter !== "all" ||
            outletFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPlanStatusFilter("all");
                  setPlanTypeFilter("all");
                  setOutletFilter("all");
                }}
                className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            ) : (
              editable && (
                <button
                  onClick={handleOpenAddModal}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-500 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Client Now</span>
                </button>
              )
            )}
          </div>
        ) : (
          <div>
            {/* Mobile & Tablet Card View (< md) */}
            <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleRowClick(client.id)}
                  className="p-4 flex flex-col gap-3 cursor-pointer hover:bg-amber-400/5 dark:hover:bg-amber-400/10 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden border border-amber-400 bg-amber-400/20 text-amber-700 font-bold text-sm">
                        {client.photoUrl ? (
                          <img src={client.photoUrl} alt={client.name} className="h-full w-full object-cover" />
                        ) : (
                          client.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{client.name}</h4>
                        <span className="text-xs text-zinc-500 line-clamp-1">{client.address}</span>
                      </div>
                    </div>

                    {(() => {
                      const planInfo = getClientPlanStatus(client, clientPlansMap[client.id] || []);
                      return (
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {planInfo.planName !== "No Plan" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 border border-amber-400/30">
                              <Layers className="h-3 w-3" />
                              {planInfo.planName}
                            </span>
                          )}
                          {planInfo.status === "Ongoing" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Ongoing
                            </span>
                          )}
                          {planInfo.status === "Expired" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-300 dark:border-red-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Expired
                            </span>
                          )}
                          {planInfo.status === "No Plan" && planInfo.planName === "No Plan" && (
                            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                              No Plan
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <a
                      href={`tel:${client.mobile}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {client.mobile}
                    </a>

                    <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <Building2 className="h-3 w-3 text-zinc-500" />
                      {client.outletName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    {client.latitude && client.longitude ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Globe className="h-3 w-3" />
                        GPS Tagged
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">No GPS</span>
                    )}

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRowClick(client.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                        title="View Profile"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {editable && (
                        <>
                          <button
                            onClick={(e) => handleOpenEditModal(client, e)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                            title="Edit Client"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenDeleteModal(client.id, client.name, e)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 dark:border-red-900/40 dark:text-red-400"
                            title="Delete Client"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Client</th>
                    <th className="px-5 py-3 font-semibold">Mobile & Email</th>
                    <th className="px-5 py-3 font-semibold">Assigned Plan & Status</th>
                    <th className="px-5 py-3 font-semibold">Gym Outlet</th>
                    <th className="px-5 py-3 font-semibold">GPS Coordinates</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedClients.map((client) => (
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
                        {(() => {
                          const planInfo = getClientPlanStatus(client, clientPlansMap[client.id] || []);
                          return (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {planInfo.planName !== "No Plan" && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-400/30">
                                    <Layers className="h-3 w-3" />
                                    {planInfo.planName}
                                  </span>
                                )}
                                {planInfo.status === "Ongoing" && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Ongoing
                                  </span>
                                )}
                                {planInfo.status === "Expired" && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-300 dark:border-red-800">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    Expired
                                  </span>
                                )}
                                {planInfo.status === "No Plan" && planInfo.planName === "No Plan" && (
                                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                    No Plan
                                  </span>
                                )}
                              </div>
                              {planInfo.endDate && (
                                <span className="text-[10px] text-zinc-400 font-medium">
                                  Valid till: <strong className="text-zinc-600 dark:text-zinc-300">{planInfo.endDate}</strong>
                                </span>
                              )}
                            </div>
                          );
                        })()}
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
                          {editable && (
                            <>
                              <button
                                onClick={(e) => handleOpenEditModal(client, e)}
                                className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
                                title="Edit Client"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleOpenDeleteModal(client.id, client.name, e)}
                                className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400 transition-colors"
                                title="Delete Client"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Showing <strong className="text-zinc-900 dark:text-zinc-100">{startIndex + 1}</strong> to{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">{Math.min(startIndex + itemsPerPage, filteredClients.length)}</strong> of{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">{filteredClients.length}</strong> clients
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

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-6 flex items-start justify-center">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-4 sm:my-8 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 relative">
            {/* Modal Header (Sticky) */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-4 backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/95">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-black">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {editingId ? "Edit Client Member" : "Add New Client Member"}
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {editingId
                      ? "Update member profile and branch assignment"
                      : "Register member with photo, plan assignment & initial payment"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveClient} className="flex flex-col">
              <div className="p-6 flex flex-col gap-4">
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
                        onClick={toggleCameraFacingMode}
                        className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
                        <span>{cameraFacingMode === "user" ? "Back Camera" : "Front Camera"}</span>
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
                      onClick={() => startCamera()}
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

              {/* Outlet Selection & Plan Selection (2 cols) */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Gym Outlet <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedOutletId}
                    onChange={(e) => handleOutletChange(e.target.value)}
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

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Membership Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedPlanId}
                    onChange={(e) => {
                      if (!editingId) {
                        handlePlanSelect(e.target.value);
                      } else {
                        setSelectedPlanId(e.target.value);
                      }
                    }}
                    className="cursor-pointer h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  >
                    {availablePlans.length === 0 ? (
                      <option value="">No plans configured for this outlet</option>
                    ) : (
                      availablePlans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.amount}){p.outletId && p.outletId !== "all" ? ` [${p.outletName || "Branch"}]` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* If creating new client, show Plan Amount, Received Amount, Payment Method, Dates */}
              {!editingId && (
                <div className="rounded-xl border border-amber-300/60 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 dark:border-amber-900/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <IndianRupee className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span>Plan Pricing & Initial Payment</span>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                      Auto-creates assigned plan & receipt
                    </span>
                  </div>

                  {/* Plan Amount & Discount */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Plan Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={planAmount}
                        onChange={(e) => handlePlanAmountChange(e.target.value)}
                        className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={planDiscount}
                        onChange={(e) => handlePlanDiscountChange(e.target.value)}
                        className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Total Payable (₹)
                      </label>
                      <div className="h-8.5 w-full rounded-lg border border-zinc-200 bg-zinc-100 px-2.5 flex items-center text-xs font-bold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                        ₹{Math.max(0, (parseFloat(planAmount) || 0) - (parseFloat(planDiscount) || 0))}
                      </div>
                    </div>
                  </div>

                  {/* Received Amount & Payment Method */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Received Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-green-700 dark:text-green-400 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        className="cursor-pointer h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Split">Split Payment (Cash + UPI + Card)</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                  </div>

                  {/* Split Payment Breakdown Inputs */}
                  {paymentMethod === "Split" && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3.5 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/30 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 dark:border-amber-900/40">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                          <CreditCard className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Split Payment Breakdown</span>
                        </div>
                        {(() => {
                          const total =
                            (parseFloat(splitCash) || 0) +
                            (parseFloat(splitUpi) || 0) +
                            (parseFloat(splitCard) || 0);
                          const target = parseFloat(receivedAmount) || 0;
                          const diff = Math.round((total - target) * 100) / 100;
                          return (
                            <span
                              className={`text-[11px] font-bold ${
                                Math.abs(diff) < 0.01
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-500"
                              }`}
                            >
                              Split Total: ₹{total} / ₹{target}{" "}
                              {diff !== 0 && (
                                <span className="text-[10px] font-medium">
                                  ({diff > 0 ? `+₹${diff} excess` : `-₹${Math.abs(diff)} remaining`})
                                </span>
                              )}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Cash (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={splitCash}
                            onChange={(e) => setSplitCash(e.target.value)}
                            className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            UPI (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={splitUpi}
                            onChange={(e) => setSplitUpi(e.target.value)}
                            className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Card (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={splitCard}
                            onChange={(e) => setSplitCard(e.target.value)}
                            className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Start Date, Duration (Months), End Date */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={planStartDate}
                        onChange={(e) => handlePlanStartDateChange(e.target.value)}
                        className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Duration (Months)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={planDurationMonths}
                        onChange={(e) => handlePlanDurationChange(e.target.value)}
                        className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        End Date (Expiry)
                      </label>
                      <input
                        type="date"
                        required
                        value={planEndDate}
                        onChange={(e) => setPlanEndDate(e.target.value)}
                        className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>
              )}

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

              </div>

              {/* Modal Actions (Sticky Footer) */}
              <div className="sticky bottom-0 z-20 flex items-center justify-end gap-2.5 border-t border-zinc-200 bg-zinc-50/95 px-6 py-3.5 backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/95">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-5 py-2 text-xs font-bold text-black shadow-md hover:bg-amber-500 disabled:opacity-50 transition-colors"
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
      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Client Member"
        message={`Are you sure you want to delete member "${deleteTarget?.name}"? All associated data will be permanently removed.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
