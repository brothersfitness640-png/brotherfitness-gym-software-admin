"use client";

import { useState, useEffect, useRef } from "react";
import PageContainer from "@/components/PageContainer";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import QRCode from "qrcode";
import {
  QrCode,
  Building2,
  Download,
  Loader2,
  CheckCircle2,
  MapPin,
  Phone,
  Search,
  ExternalLink,
  Printer,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface GymOutlet {
  id: string;
  name: string;
  address: string;
  phone?: string;
  qrCodeUrl?: string;
  qrGeneratedAt?: any;
}

export default function OutletsQrCodePage() {
  const { canEdit } = useAuth();
  const editable = canEdit("/outlets-qr");

  const [outlets, setOutlets] = useState<GymOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "outlets"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as GymOutlet[];
      setOutlets(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Generate QR Code with Brothers Fitness branding on Canvas & upload to ImageKit
  const handleGenerateQr = async (outlet: GymOutlet) => {
    if (!editable) return;
    setGeneratingId(outlet.id);
    try {
      // 1. Data payload embedded in the QR
      const qrPayload = JSON.stringify({
        app: "BROTHERS_FITNESS",
        type: "OUTLET_ATTENDANCE",
        outletId: outlet.id,
        outletName: outlet.name,
        timestamp: Date.now(),
      });

      // 2. Generate raw QR code data URL
      const qrRawDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 600,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // 3. Draw on branded Canvas with Gym header & outlet title
      const canvas = document.createElement("canvas");
      canvas.width = 700;
      canvas.height = 920;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 700, 920);

        // Top Gold Header Banner
        const gradient = ctx.createLinearGradient(0, 0, 700, 140);
        gradient.addColorStop(0, "#F59E0B");
        gradient.addColorStop(1, "#D97706");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 700, 140);

        // Header Title
        ctx.fillStyle = "#000000";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BROTHERS FITNESS", 350, 60);

        ctx.font = "bold 18px sans-serif";
        ctx.fillText("OFFICIAL GYM ATTENDANCE QR", 350, 95);

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.font = "14px sans-serif";
        ctx.fillText("Scan to mark member attendance instantly", 350, 120);

        // Draw QR Image
        const qrImg = new Image();
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = qrRawDataUrl;
        });

        // Center the 540x540 QR
        ctx.drawImage(qrImg, 80, 170, 540, 540);

        // Outlet Name Card at bottom
        ctx.fillStyle = "#F3F4F6";
        ctx.roundRect(50, 740, 600, 130, 16);
        ctx.fill();
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#111827";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(outlet.name.toUpperCase(), 350, 785);

        ctx.fillStyle = "#6B7280";
        ctx.font = "14px sans-serif";
        const shortAddr =
          outlet.address.length > 55
            ? outlet.address.substring(0, 52) + "..."
            : outlet.address;
        ctx.fillText(shortAddr, 350, 815);

        ctx.fillStyle = "#D97706";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("• GPS VERIFIED ATTENDANCE STATION •", 350, 845);

        // Convert canvas to image blob/base64
        const finalBrandedDataUrl = canvas.toDataURL("image/png", 0.95);

        // 4. Upload to ImageKit via /api/upload-image
        const formData = new FormData();
        formData.append("file", finalBrandedDataUrl);
        formData.append(
          "fileName",
          `outlet_qr_${outlet.name.replace(/[^a-zA-Z0-9]/g, "_")}_${outlet.id}.png`
        );

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload QR to ImageKit");
        }

        const data = await res.json();
        const uploadedUrl = data.url || finalBrandedDataUrl;

        // 5. Save URL to Firestore
        await updateDoc(doc(db, "outlets", outlet.id), {
          qrCodeUrl: uploadedUrl,
          qrGeneratedAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error("Error generating outlet QR:", err);
      alert("Failed to generate QR code: " + (err.message || "Unknown error"));
    } finally {
      setGeneratingId(null);
    }
  };

  // Download QR handler
  const handleDownloadQr = async (outlet: GymOutlet) => {
    if (!outlet.qrCodeUrl) return;

    try {
      const response = await fetch(outlet.qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Brothers_Fitness_QR_${outlet.name.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: direct window open
      window.open(outlet.qrCodeUrl, "_blank");
    }
  };

  const filteredOutlets = outlets.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer
      title="Outlets Attendance QR Codes"
      subtitle="Generate, preview, and download official attendance station QR codes saved on ImageKit CDN"
    >
      {!editable && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span><strong>View-Only Mode:</strong> Your staff account has view permissions for Outlets QR. Generating new QR codes is restricted.</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-black shadow-md">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Brothers Fitness Attendance QR Stations
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Each gym branch outlet has an attendance QR code for members to scan on arrival.
              </p>
            </div>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search outlets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8.5 w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Grid of Outlets */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
          <span className="text-xs font-semibold text-zinc-500">
            Loading outlet QR codes...
          </span>
        </div>
      ) : filteredOutlets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-zinc-200 rounded-2xl bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <Building2 className="h-10 w-10 text-zinc-400 mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            No Outlets Found
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Please add gym outlets in the Gym Outlets module before generating QR codes.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOutlets.map((outlet) => {
            const hasQr = !!outlet.qrCodeUrl;
            const isGenerating = generatingId === outlet.id;

            return (
              <div
                key={outlet.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-amber-400/60 transition-all"
              >
                <div>
                  {/* Outlet Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-700 dark:text-amber-400">
                        <Building2 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {outlet.name}
                        </h4>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          <span className="truncate max-w-[180px]">{outlet.address}</span>
                        </span>
                      </div>
                    </div>

                    {hasQr ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-300 shrink-0">
                        <span>No QR</span>
                      </span>
                    )}
                  </div>

                  {/* QR Preview or Placeholder */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 my-2 min-h-[220px]">
                    {hasQr ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="relative h-44 w-44 rounded-xl overflow-hidden bg-white p-2 shadow-sm border border-zinc-200 dark:border-zinc-700">
                          <img
                            src={outlet.qrCodeUrl}
                            alt={`${outlet.name} QR Code`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium mt-2">
                          Saved on ImageKit CDN
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-4">
                        <div className="h-16 w-16 rounded-2xl bg-zinc-200/60 dark:bg-zinc-700/60 flex items-center justify-center text-zinc-400 mb-2">
                          <QrCode className="h-8 w-8" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          QR Code Not Generated
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[200px]">
                          Click Generate QR below to create official QR code.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  {hasQr ? (
                    /* ONLY DISPLAY DOWNLOAD IF QR EXISTS */
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadQr(outlet)}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download QR Code</span>
                      </button>
                      <button
                        onClick={() => window.open(outlet.qrCodeUrl, "_blank")}
                        className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : editable ? (
                    /* ONLY DISPLAY GENERATE IF NO QR CODE AND EDITABLE */
                    <button
                      onClick={() => handleGenerateQr(outlet)}
                      disabled={isGenerating}
                      className="cursor-pointer w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 py-2 text-xs font-bold text-black shadow-xs hover:bg-amber-500 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating & Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Generate QR</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-center py-2 text-xs text-zinc-400 italic">
                      Generation restricted (View-only mode)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
