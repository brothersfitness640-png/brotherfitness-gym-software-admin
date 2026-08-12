"use client";

import { useState, useEffect } from "react";
import PageContainer from "@/components/PageContainer";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import {
  Building2,
  Receipt,
  Save,
  CheckCircle2,
  Loader2,
  Upload,
  Phone,
  Mail,
  MapPin,
  Globe,
  User,
  Percent,
  FileText,
  Sliders,
  ShieldCheck,
} from "lucide-react";

interface SettingsData {
  // General Business Details
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  logoUrl?: string;

  // GST & Tax Configuration
  gstEnabled: boolean;
  gstNumber: string;
  gstPercentage: number;

  updatedAt?: any;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "gst">("general");

  // Form State
  const [businessName, setBusinessName] = useState("Brother's Fitness");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // GST State
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [gstPercentage, setGstPercentage] = useState("18");

  // Loading & Saving State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  // 1. Real-time Listen to Firestore `settings/general`
  useEffect(() => {
    const docRef = doc(db, "settings", "general");
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SettingsData;
        setBusinessName(data.businessName || "Brother's Fitness");
        setOwnerName(data.ownerName || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setAddress(data.address || "");
        setWebsite(data.website || "");
        setLogoUrl(data.logoUrl || "");

        setGstEnabled(data.gstEnabled || false);
        setGstNumber(data.gstNumber || "");
        setGstPercentage((data.gstPercentage || 18).toString());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Handle Logo Upload to ImageKit via API
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `logo_${Date.now()}.${file.name.split(".").pop()}`);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setLogoUrl(data.url);
        }
      } else {
        alert("Failed to upload logo to ImageKit.");
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      alert("Error uploading logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    try {
      const settingsPayload: SettingsData = {
        businessName: businessName.trim() || "Brother's Fitness",
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        website: website.trim(),
        logoUrl: logoUrl,

        gstEnabled: gstEnabled,
        gstNumber: gstEnabled ? gstNumber.trim().toUpperCase() : "",
        gstPercentage: gstEnabled ? parseFloat(gstPercentage) || 0 : 0,

        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "settings", "general"), settingsPayload, { merge: true });

      setSuccessMsg("Settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
        <span className="text-xs font-semibold text-zinc-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <PageContainer
      title="Business & System Settings"
      subtitle="Configure Brother's Fitness business profile, logo, GST tax parameters, and preferences"
    >
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "general"
              ? "bg-amber-400 text-black shadow-xs font-bold"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>General Business Details</span>
        </button>

        <button
          onClick={() => setActiveTab("gst")}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "gst"
              ? "bg-amber-400 text-black shadow-xs font-bold"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>GST & Tax Settings</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-100 p-4 text-xs font-bold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-6">
        {/* --- TAB 1: GENERAL BUSINESS DETAILS --- */}
        {activeTab === "general" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-5">
            <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                General Business Profile
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Configure your gym business information, contact details, and brand logo
              </p>
            </div>

            {/* Gym Brand Logo Box */}
            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="relative h-20 w-20 rounded-2xl border-2 border-amber-400 bg-white overflow-hidden shadow-xs shrink-0 flex items-center justify-center dark:bg-zinc-900">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                ) : (
                  <Building2 className="h-8 w-8 text-amber-500" />
                )}
                {logoUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 text-center sm:text-left">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Gym Business Logo / Branding
                </h4>
                <p className="text-[11px] text-zinc-500 max-w-sm">
                  Upload your official logo to display on invoices, receipts, and client portals. Saved to ImageKit CDN.
                </p>

                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 self-center sm:self-start mt-1">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{logoUrl ? "Change Logo" : "Upload Logo"}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Business / Gym Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brother's Fitness Gym"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Owner / Proprietor Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. Siva Krishna"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Business Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="e.g. info@brothersfitness.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Business Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Plot No 45, Main Road, Jubilee Hills, Hyderabad, Telangana 500033"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 pt-2 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Website URL (Optional)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="url"
                    placeholder="e.g. https://www.brothersfitness.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: GST & TAX SETTINGS --- */}
        {activeTab === "gst" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-5">
            <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                GST Tax Configuration
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Enable GST tax calculations, specify GSTIN registration number, and set standard GST rate (%)
              </p>
            </div>

            {/* Toggle Switch Box */}
            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Enable GST Tax Calculation
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  When enabled, GST percentage will be applied to membership plans and product purchases.
                </p>
              </div>

              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={gstEnabled}
                  onChange={(e) => setGstEnabled(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-zinc-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-400 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-zinc-700" />
              </label>
            </div>

            {/* Conditional GST Input Fields */}
            {gstEnabled ? (
              <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    GST Identification Number (GSTIN) *
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      required={gstEnabled}
                      placeholder="e.g. 36AAAAA0000A1Z5"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-bold text-zinc-900 outline-none uppercase focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Default GST Percentage (%) *
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-500" />
                    <input
                      type="number"
                      required={gstEnabled}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 18"
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(e.target.value)}
                      className="h-9.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-bold text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500 dark:border-zinc-800">
                GST is currently disabled. Toggle ON to configure your GSTIN and Tax percentage.
              </div>
            )}
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer flex h-10 items-center gap-2 rounded-xl bg-amber-400 px-6 text-xs font-bold text-black hover:bg-amber-500 shadow-md transition-transform active:scale-98"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
