"use client";

import { useState } from "react";
import PageContainer from "@/components/PageContainer";
import { useToast } from "@/components/ToastProvider";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  PhoneCall,
  MessageSquare,
  Mail,
  Globe,
  Clock,
  ShieldCheck,
  Send,
  HelpCircle,
  Headphones,
  CheckCircle2,
  Loader2,
  Sparkles,
  ChevronRight,
  Building2,
  ExternalLink,
} from "lucide-react";

export default function SupportPage() {
  const toast = useToast();

  const [senderName, setSenderName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [inquiryType, setInquiryType] = useState("Technical Assistance");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderName.trim() || !contactInfo.trim() || !message.trim()) {
      toast.warning("Please fill in all required fields (Name, Contact, Message)");
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "support_inquiries"), {
        senderName: senderName.trim(),
        contactInfo: contactInfo.trim(),
        inquiryType: inquiryType,
        message: message.trim(),
        status: "Open",
        createdAt: serverTimestamp(),
      });

      toast.success("Support inquiry submitted to GamaNext team! We will reach out shortly.");
      setSenderName("");
      setContactInfo("");
      setMessage("");
    } catch (err) {
      console.error("Error submitting support inquiry:", err);
      toast.error("Failed to submit inquiry. Please try contacting via WhatsApp or Phone.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageContainer
      title="GamaNext Support & Contact"
      subtitle="Official technical support and contact details for Brother's Fitness software"
    >
      {/* AGENCY BRAND HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8 text-white shadow-xl dark:border-zinc-800 mb-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
              <Sparkles className="h-3.5 w-3.5" /> Official Software Partner
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-amber-400">
              GamaNext Software Solutions
            </h2>
            <p className="text-xs md:text-sm text-zinc-300 font-medium leading-relaxed">
              Empowering gym operations with high-performance admin portals, biometric attendance, financial analytics, and custom client management systems.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs text-zinc-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Verified Support
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-400" /> Mon - Sat: 9am - 8pm
              </span>
            </div>
          </div>

          {/* Quick WhatsApp Action Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href="https://wa.me/916281288314?text=Hello%20GamaNext%20Team%2C%20I%20need%20assistance%20with%20Brother's%20Fitness%20Gym%20Admin%20Software"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-600 active:scale-95 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Instant WhatsApp Support</span>
            </a>

            <a
              href="tel:+916281288314"
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition-all"
            >
              <PhoneCall className="h-4 w-4 text-amber-400" />
              <span>Call Technical Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* CONTACT METHODS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Phone Support */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
              <PhoneCall className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Phone Support
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Direct line for urgent gym software queries
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <a
              href="tel:+916281288314"
              className="text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-between"
            >
              <span>+91 62812 88314</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* WhatsApp Direct Chat */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              WhatsApp Chat
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Instant response & screenshot sharing
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <a
              href="https://wa.me/916281288314"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-between"
            >
              <span>Chat on WhatsApp</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Email Support */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-3">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Support Email
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Send detailed feature requests or bug logs
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <a
              href="mailto:support@gamanext.com"
              className="text-xs font-extrabold text-sky-600 dark:text-sky-400 hover:underline flex items-center justify-between"
            >
              <span>support@gamanext.com</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Website & Portal */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-3">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              GamaNext Website
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Explore software updates & agency portfolio
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <a
              href="https://gamanext.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center justify-between"
            >
              <span>www.gamanext.com</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* HELPDESK INQUIRY FORM & ABOUT SECTION */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Support Inquiry Form */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Submit Technical Helpdesk Inquiry
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
            Fill in your query details below. Our GamaNext technical team will review and respond directly to your contact.
          </p>

          <form onSubmit={handleSubmitInquiry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Your Name / Representative *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SivaKrishna / Admin"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mobile / Email for Contact *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6281288314 / admin@brotherfitness.com"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Inquiry Topic / Module *
              </label>
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-zinc-200 px-3 text-xs font-bold dark:bg-zinc-800 focus:border-amber-500 focus:outline-none"
              >
                <option value="Technical Assistance">Technical Assistance / Troubleshooting</option>
                <option value="Biometric Attendance & Security Scan">Biometric Attendance & Security Scan</option>
                <option value="Billing & Financial Reports">Billing & Financial Reports</option>
                <option value="Feature Request & Custom Module">Feature Request & Custom Module</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Message / Issue Description *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe your question, request, or issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 p-3 text-xs font-medium dark:bg-zinc-800 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={sending}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-500 transition-all shadow-md"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Submit Inquiry to GamaNext</span>
              </button>
            </div>
          </form>
        </div>

        {/* Company Profile Sidebar Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                About GamaNext
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              GamaNext Software Solutions builds bespoke web applications, mobile apps, and business management portals tailored for modern enterprises.
            </p>

            <div className="mt-5 space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                  Custom Gym Management Engine
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                  Realtime Database Synchronization
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                  Dedicated Technical Support
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400">
            <p>© 2026 GamaNext Software Solutions.</p>
            <p className="mt-0.5 font-medium text-amber-600 dark:text-amber-400">Brother's Fitness Gym Portal v1.0</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
